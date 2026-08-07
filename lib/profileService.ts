import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  gmail: string;
  mode: 'user' | 'pro';
  created_at?: string;
  updated_at?: string;
}

export interface SharedItem {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_email: string;
  receiver_id: string;
  item_type: 'link' | 'doc' | 'memo';
  item_data: any;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export async function getUserProfile(user: User, forceRefresh: boolean = false): Promise<UserProfile> {
  const cacheKey = `user_profile_${user.id}`;
  if (!forceRefresh) {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached) as UserProfile;
      }
    } catch (e) {}
  }

  const defaultName = user.user_metadata?.full_name || 
                     user.user_metadata?.display_name || 
                     user.email?.split('@')[0] || 'User';

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // If profile exists, cache and return it directly
    if (data) {
      const prof = data as UserProfile;
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(prof));
      } catch (e) {}
      return prof;
    }

    // Profile does not exist yet (first-time fallback), create it
    const newProfile = {
      id: user.id,
      name: defaultName,
      gmail: user.email || '',
    };

    const { data: inserted } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select('*')
      .single();

    if (inserted) {
      const prof = inserted as UserProfile;
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(prof));
      } catch (e) {}
      return prof;
    }
  } catch (err) {
    console.error('Error fetching/creating profile:', err);
  }

  const fallbackProfile: UserProfile = {
    id: user.id,
    name: defaultName,
    gmail: user.email || '',
    mode: 'user',
  };
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(fallbackProfile));
  } catch (e) {}
  return fallbackProfile;
}

export async function updateProfileName(userId: string, newName: string) {
  try {
    await supabase.from('profiles').update({ name: newName, updated_at: new Date().toISOString() }).eq('id', userId);
    const cacheKey = `user_profile_${userId}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.name = newName;
        sessionStorage.setItem(cacheKey, JSON.stringify(parsed));
      }
    } catch (e) {}
  } catch (err) {
    console.error('Error updating profile name:', err);
  }
}

export async function getAllProfiles(currentUserId: string): Promise<UserProfile[]> {
  try {
    const fetchPromise = supabase
      .from('profiles')
      .select('*')
      .neq('id', currentUserId)
      .order('name', { ascending: true });

    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('Request timeout') }), 6000)
    );

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (!error && data) return data as UserProfile[];
  } catch (err) {
    console.error('Error fetching profiles:', err);
  }
  return [];
}

export async function shareItem(
  senderUser: User,
  senderName: string,
  receiverProfile: UserProfile,
  itemType: 'link' | 'doc' | 'memo',
  itemData: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('shared_items').insert([{
      sender_id: senderUser.id,
      sender_name: senderName,
      sender_email: senderUser.email || '',
      receiver_id: receiverProfile.id,
      item_type: itemType,
      item_data: itemData,
      status: 'pending'
    }]);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to share item' };
  }
}

export async function getPendingNotifications(userId: string): Promise<SharedItem[]> {
  try {
    const { data, error } = await supabase
      .from('shared_items')
      .select('*')
      .eq('receiver_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (!error && data) return data as SharedItem[];
  } catch (err) {
    console.error('Error fetching notifications:', err);
  }
  return [];
}

export async function acceptSharedItem(sharedItem: SharedItem, receiverId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { item_type, item_data } = sharedItem;

    if (item_type === 'link') {
      const { error } = await supabase.from('links').insert([{
        user_id: receiverId,
        title: item_data.title || item_data.url,
        url: item_data.url
      }]);
      if (error) throw error;
    } else if (item_type === 'doc') {
      const { error } = await supabase.from('docs').insert([{
        user_id: receiverId,
        name: item_data.name,
        storage_path: item_data.storage_path,
        size: item_data.size,
        mime_type: item_data.mime_type
      }]);
      if (error) throw error;
    } else if (item_type === 'memo') {
      const { error } = await supabase.from('memos').insert([{
        user_id: receiverId,
        title: item_data.title,
        content: item_data.content
      }]);
      if (error) throw error;
    }

    // Delete or update shared item status
    await supabase.from('shared_items').delete().eq('id', sharedItem.id);
    return { success: true };
  } catch (err: any) {
    console.error('Error accepting shared item:', err);
    return { success: false, error: err.message || 'Failed to accept item' };
  }
}

export async function rejectSharedItem(sharedItemId: string): Promise<{ success: boolean }> {
  try {
    await supabase.from('shared_items').delete().eq('id', sharedItemId);
    return { success: true };
  } catch (err) {
    console.error('Error rejecting shared item:', err);
    return { success: false };
  }
}
