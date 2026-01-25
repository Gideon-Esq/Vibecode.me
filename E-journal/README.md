# AuraJournal

A fully functional, encrypted, Local-First Progressive Web App (PWA) Journal.

## Features

- **Local-First**: All data is stored in your browser using IndexedDB (Dexie.js).
- **Encrypted**: Military-grade encryption (AES-GCM-256) using Web Crypto API. Zero-knowledge privacy.
- **PWA**: Installable on mobile and desktop. Offline capable.
- **Journal Vibe**: Custom typography, paper textures, and distraction-free writing.

## Setup

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run development server:
    ```bash
    npm run dev
    ```

3.  Build for production:
    ```bash
    npm run build
    ```

## Security Model

- **Master Password**: Used to derive a Key Encryption Key (KEK) via PBKDF2.
- **Data Encryption Key (DEK)**: Generated randomly, encrypted by KEK, and stored in IndexedDB.
- **Entries**: Title and Body are encrypted with DEK.
- **Recovery**: Export an encrypted JSON backup from Settings.

## Tech Stack

- React + Vite
- TypeScript
- Tailwind CSS (v3)
- Dexie.js
- Web Crypto API
