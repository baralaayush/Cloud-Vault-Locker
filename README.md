<p align="center">
  <img src="https://aayushbaralsite.wordpress.com/wp-content/uploads/2026/08/locker-app-title-logo.png" alt="Locker Logo" width="120" />
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="React" width="40" height="40" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="TypeScript" width="40" height="40" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" alt="Tailwind CSS" width="40" height="40" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/vitejs/vitejs-original.svg" alt="Vite" width="40" height="40" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/supabase/supabase-original.svg" alt="Supabase" width="40" height="40" />
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

## 🚀 What's New: Upgraded Features (Portal Hub ➔ Locker)

The transformation from **Portal Hub** to **Locker** brings significant UI/UX enhancements, expanded authentication options, and web app capabilities:

* **🔐 Self-Service User Registration:**
  * **Portal Hub (Legacy):** Required users to manually contact the owner via message to create an account.
  * **Locker (Upgraded):** Features a self-service **Sign In / Register** toggle tab allowing users to create their own accounts instantly.

* **🔑 Password Recovery System:**
  * Added a dedicated **"Forgot password?"** link directly on the login panel for quick credential resets via Supabase Auth.

* **📱 Native Progressive Web App (PWA) Support:**
  * Added an interactive **"Install Locker"** prompt allowing users to install Locker directly onto their home screen or desktop for native app access.

* **🎨 Modern Split-Screen Authentication UI:**
  * Replaced the single card portal UI with an interactive split-screen dashboard layout displaying live app overview cards (Quick Links, Document Vault, Smart Memos) alongside authentication forms.

* **👁️ Enhanced Input Security:**
  * Integrated a password visibility toggle (eye icon) inside input fields for better user convenience.

---

## ✨ Key Features

* 🔗 **Quick Links:** Bookmark, tag, and categorize your essential web links and resources for instant access.
* 📄 **Document Vault:** Store, search, and manage your important personal files directly via Supabase Storage.
* 📝 **Smart Memos:** Keep persistent notes, code snippets, and daily ideas synchronized in real-time.
* 💰 **Locker PRO:** Architected to unlock extreme features like global communication networks, file sharing, and expanded storage.

---

## 🛠️ Tech Stack & Dependencies

* **Frontend:** React.js, TypeScript, Vite
* **Styling & UI:** Tailwind CSS, `index.css`
* **Backend & Database:** Supabase (PostgreSQL, Realtime Subscriptions, Supabase Storage & Auth)
* **Package Management:** Bun / npm (`bun.lock`, `package.json`)

---

## 📁 Repository Structure

```text
.
├── .github/workflows/   # GitHub Actions (Supabase keep-alive automation)
├── components/          # Reusable React components (Vault cards, memo editor, inputs)
├── lib/                 # Shared utilities and helper functions
├── public/              # Static public assets, PWA manifest, and icons
├── src/assets/images/   # Logo assets and UI graphics
├── App.tsx              # Main dashboard application logic
├── index.html           # HTML entry point
├── index.tsx            # React application root mount
├── manifest.json        # PWA configuration
├── supabaseClient.ts    # Supabase backend client configuration
├── vite.config.ts       # Vite bundler configuration
└── package.json         # Project scripts and dependencies