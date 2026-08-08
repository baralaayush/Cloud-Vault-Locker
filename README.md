<p align="center">
  <img src="https://aayushbaralsite.wordpress.com/wp-content/uploads/2026/08/locker-app-title-logo.png" alt="Locker Logo" width="120" />
</p>

<h1 align="center">Locker</h1>

<p align="center">
  <strong>Personal Secure & Digital Cloud Vault Locker</strong>
</p>

<p align="center">
  A personal, secure cloud vault locker designed to organize your daily links, documents, and quick memos in one unified dashboard.
</p>

<p align="center">
  <a href="https://locker.baralaayush.com.np/"><strong>🌐 Visit Live App</strong></a>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-teal.svg" alt="License: MIT" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Backend-Supabase-3ECF8E.svg" alt="Powered by Supabase" /></a>
  <img src="https://img.shields.io/badge/Status-Upgraded%20v2.0-blue.svg" alt="Version 2.0" />
</p>

---

## 📌 Overview & Evolution

**Locker** eliminates tab overload and scattered notes by bringing your essential productivity tools under one roof. Access your personal cloud vault anytime, anywhere, with structured organization and fast search capabilities.

### 🔄 Evolution (Upgraded from PortalHub)
* **Rebranded Core:** Evolved from the legacy **PortalHub** resource manager into a full digital cloud vault architecture (**Locker**).
* **Enhanced Document Storage:** Direct file uploads, management, and retrieval powered by Supabase Storage.
* **Modernized UI:** Redesigned responsive layout with Tailwind CSS and official branding assets.
* **Pro Features Architecture:** Expanded codebase to support future features like encrypted file sharing and global communication networks.

---

## ✨ Key Features

* 🔗 **Quick Links:** Bookmark, tag, and categorize your essential web links and resources for instant access.
* 📄 **Document Vault:** Store, search, and manage your important personal files directly via Supabase Storage.
* 📝 **Smart Memos:** Keep persistent notes, code snippets, and daily ideas synchronized in real-time.
* 💰 **Locker PRO:** Pro features unlock extreme capabilities like global communication networks, multi-user file sharing, and expanded storage space.

---

## 🛠️ Tech Stack & Dependencies

* **Frontend:** React.js, TypeScript, Vite
* **Styling & UI:** Tailwind CSS, `index.css`
* **Backend & Database:** Supabase (PostgreSQL, Realtime subscriptions, Supabase Storage)
* **Package Management:** Bun / npm (`bun.lock`, `package.json`)

---

## 📁 Repository Structure

```text
.
├── .github/workflows/   # GitHub Actions (Supabase keep-alive automation)
├── components/          # Reusable React components (Vault cards, memo editor, inputs)
├── lib/                 # Shared utilities and helper functions
├── public/              # Static public assets and icons
├── src/assets/images/   # Logo assets and UI graphics
├── App.tsx              # Main dashboard application logic
├── index.html           # HTML entry point
├── index.tsx            # React application root mount
├── manifest.json        # Progressive Web App (PWA) manifest settings
├── supabaseClient.ts    # Supabase backend client configuration
├── vite.config.ts       # Vite bundler configuration
└── package.json         # Project scripts and dependencies
