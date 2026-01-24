# AuraJournal

A fully encrypted, local-first Progressive Web App (PWA) that feels like a physical, leather-bound journal.

## Features

### 🔒 Military-Grade Security
- **Zero-Knowledge Encryption**: Your master password is never stored. It creates a hash that derives your encryption key.
- **AES-GCM-256**: All entries are encrypted using the Web Crypto API with AES-GCM-256 encryption.
- **Local-First**: All data stays on your device using IndexedDB (via Dexie.js).

### 📖 The "Real Journal" Experience
- **Typography Engine**: Choose from 4 font themes:
  - Handwriting (Caveat)
  - Elegant Script (Dancing Script)
  - Classic (Merriweather)
  - Modern (Inter)
- **Paper-Like Design**: Warm "Paper White" (#fdfbf7) and "Midnight Slate" (#1a1a1a) themes with subtle grain texture.
- **Timeline View**: Entries grouped by Year → Month → Day.

### ✍️ Distraction-Free Editor
- Markdown support (Bold, Italic, Lists)
- Auto-save with visual "Saved" indicator
- Clean, minimal interface

### 📱 Mobile-First PWA
- Fully responsive design
- Touch-optimized (44px minimum touch targets)
- Offline capable with Service Worker
- Installable on any device

### 💾 Disaster Recovery
- Export encrypted backup as JSON
- Import backups to restore data
- Never lose your entries

## Tech Stack

- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3.4 (standard postcss + autoprefixer)
- **Storage**: Dexie.js (IndexedDB wrapper)
- **Encryption**: Native Web Crypto API
- **PWA**: vite-plugin-pwa

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
AuraJournal/
├── src/
│   ├── components/       # React components
│   │   ├── BottomNav.tsx
│   │   ├── Editor.tsx
│   │   ├── Header.tsx
│   │   ├── Settings.tsx
│   │   ├── Timeline.tsx
│   │   └── VaultLock.tsx
│   ├── contexts/         # React context providers
│   │   └── AppContext.tsx
│   ├── services/         # Core services
│   │   ├── CryptoService.ts  # AES-GCM-256 encryption
│   │   └── StorageService.ts # Dexie.js database
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
│   └── favicon.svg
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## Security Notes

- Your master password derives an encryption key using PBKDF2 with 100,000 iterations
- Each entry is encrypted with a unique IV (Initialization Vector)
- Password validation uses an encrypted test phrase - the password itself is never stored
- All cryptographic operations use the browser's native Web Crypto API

## License

Private - All rights reserved
