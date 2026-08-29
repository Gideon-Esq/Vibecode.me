# VaultJournal

A Local-First, Zero-Knowledge Encryption Progressive Web App (PWA) Journal.

## Core Value Proposition

- **Lifetime Access**: You own your data completely. No reliance on external backend servers. Data is stored locally in your browser.
- **Military-Grade Security**: Zero-Knowledge Architecture. Even the developer cannot access your data.
- **Meta-Tier UX**: Minimal, distraction-free, and highly responsive interface.

## Technical Architecture

### Security (The "Unhackable" Requirement)
- **Zero-Knowledge Architecture**: Client-Side Encryption using native Web Crypto API.
- **Key Derivation**: PBKDF2 (SHA-256, 100,000 iterations) derives the encryption key from your Master Password.
- **Encryption**: AES-GCM (256-bit) encrypts all journal entries (title and body) before saving to IndexedDB.
- **Key Storage**: The plain-text Master Password is NEVER saved to storage. It only exists in memory while the session is active.

### Storage
- **Local Storage**: Uses IndexedDB (via Dexie.js) for robust local data storage.
- **Disaster Recovery**: One-click export of encrypted JSON backup files.

### PWA Capabilities
- Works 100% offline.
- Installable on iOS and Android.

## Tech Stack

- **Frontend**: React (Vite), TypeScript
- **Styling**: Tailwind CSS, Framer Motion (animations)
- **Icons**: Lucide React
- **Editor**: Tiptap (Rich Text)
- **Storage**: Dexie.js (IndexedDB wrapper)
- **Encryption**: Web Crypto API

## Setup & Running

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Usage

1. **Onboarding**: Set your Master Password. **WARNING**: There is no password reset. If you lose this password, your data is lost forever.
2. **Writing**: Click "New Entry" to start writing in the distraction-free editor.
3. **Backup**: Go to Settings to download an encrypted backup of your journal.

## License

MIT
