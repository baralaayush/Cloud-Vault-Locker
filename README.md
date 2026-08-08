<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="React" width="50" height="50" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="TypeScript" width="50" height="50" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" alt="Tailwind CSS" width="50" height="50" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/vitejs/vitejs-original.svg" alt="Vite" width="50" height="50" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/supabase/supabase-original.svg" alt="Supabase" width="50" height="50" />
</p>

<h1 align="center">Locker (Cloud Vault Locker)</h1>

<p align="center">
  <strong>Personal Secure & Digital Cloud Vault Locker</strong> — The upgraded successor to <em>PortalHub</em>.
</p>

<p align="center">
  <a href="https://locker.baralaayush.com.np/"><strong>🌐 Visit Live App</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License MIT" />
  <img src="https://img.shields.io/badge/Backend-Supabase-emerald.svg" alt="Backend Supabase" />
  <img src="https://img.shields.io/badge/Status-Upgraded%20v2.0-blue.svg" alt="Version 2.0" />
</p>

---

## 📌 Overview & Evolution

**Locker** is an all-in-one personal productivity vault built to eliminate tab overload and scattered notes. It brings your essential digital tools—links, documents, and memos—under one secure, unified dashboard.

### 🔄 What's New (Upgraded from PortalHub)
* **Rebranded Core:** Transitioned from the legacy **PortalHub** layout to a full cloud vault architecture (**Locker**).
* **Enhanced Document Storage:** Direct file management and uploads utilizing Supabase Storage.
* **Modernized UI:** Redesigned layout with Tailwind CSS, custom favicon branding, and mobile responsiveness.
* **Pro Features Support:** Expanded architecture to support advanced file sharing and storage capabilities.

---

## ✨ Key Features

* 🔗 **Quick Links:** Bookmark, tag, and categorize your essential web links and resources for instant access.
* 📄 **Document Vault:** Store, search, and manage your important personal files directly via Supabase Storage.
* 📝 **Smart Memos:** Keep persistent notes, code snippets, and daily ideas synchronized in real-time.
* 💰 **Locker PRO Capabilities:** Architected for advanced features like expanded storage and communication networks.

---

## 🛠️ Tech Stack & Dependencies

* **Frontend:** React.js, TypeScript
* **Styling:** Tailwind CSS, `index.css`
* **Build Tooling:** Vite (`vite.config.ts`)
* **Backend & Database:** Supabase (PostgreSQL, Realtime Subscriptions, Supabase Storage)
* **Package Management:** Bun / npm (`bun.lock`, `package.json`)

---

## 📁 Repository Structure

```text
.
├── .github/workflows/   # CI/CD workflows & keep-alive scripts
├── components/          # UI components (Vault inputs, link cards, memo editors)
├── lib/                 # Core library helpers and utilities
├── public/              # Static assets and icons
├── src/assets/images/   # Branding assets, icons, and logos
├── App.tsx              # Main application dashboard layout
├── index.html           # Main HTML entry point
├── index.tsx            # React root application bootstrap
├── manifest.json        # Web app manifest configuration
├── supabaseClient.ts    # Supabase authentication & database client setup
├── vite.config.ts       # Vite bundler configuration
└── package.json         # Project dependencies and script runner
