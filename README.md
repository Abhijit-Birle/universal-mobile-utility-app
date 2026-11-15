# Konto — Universal Mobile Utility App

All-in-one personal utility app for Android and iOS. Notes, expenses, todos, timers, and AI insights in one place. Built with React + Vite, packaged for mobile with Capacitor.

> **Status:** Work in progress.
---

## Features

> Verify this list against the actual app before publishing. Remove anything not yet built.

- **Notes** — rich notes with code-friendly editor and syntax highlighting
- **Expense tracking** — local ledger with charts
- **Todo** — task lists
- **Timer / Zen** — focus timers and breathing/meditation tools
- **AI Insights** — Gemini-powered summaries and analysis
- **Export / Share** — export data to Excel (`.xlsx`), share via the native share sheet
- **Offline-first** — data stored on-device, no account needed
- **Native feel** — haptic feedback, smooth animations, 3D/WebGL visuals

## Tech Stack

| Layer | Tech |
|---|---|
| UI | React 19, Vite 8, TypeScript |
| Mobile runtime | Capacitor 8 (Android, iOS) |
| Native plugins | `@capacitor/preferences`, `filesystem`, `share`, `haptics`, `app` |
| Storage | Capacitor Preferences, IndexedDB (`idb-keyval`) |
| Animation / 3D | Framer Motion, GSAP, Three.js, React Three Fiber, Drei, OGL |
| Charts | Recharts |
| AI | Google Gemini (`@google/genai`) |
| Editor | `react-simple-code-editor` + Prism.js |
| Export | SheetJS (`xlsx`) |
| Icons | Lucide |
| Lint | Oxlint |

## Project Structure

```
.
├── android/              # Capacitor Android project
├── ios/                  # Capacitor iOS project
├── assets/               # Source assets for icon/splash generation
├── icons/                # App icons
├── public/               # Static files
├── src/                  # React app source
├── capacitor.config.ts   # Capacitor config (appId: com.konto.personal)
├── vite.config.js        # Vite config
├── index.html
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Android Studio (for Android builds)
- Xcode + CocoaPods (for iOS builds, macOS only)

### Install

```bash
git clone https://github.com/Abhijit-Birle/universal-mobile-utility-app.git
cd universal-mobile-utility-app
npm install
```

### Environment

Create `.env` in the project root:

```env
VITE_GEMINI_API_KEY=your_key_here
```

> Vite inlines `VITE_*` variables into the client bundle. The key is visible to anyone who unpacks the app. For production, proxy Gemini calls through a backend and keep the key server-side.

### Run in browser

```bash
npm run dev
```

### Build

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

### Run on device / emulator

```bash
npm run build
npx cap sync

npx cap open android   # then Run from Android Studio
npx cap open ios       # then Run from Xcode
```

Re-run `npm run build && npx cap sync` after every web code change.

### Generate icons and splash screens

```bash
npx capacitor-assets generate
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run Oxlint |

## Roadmap

- [ ] Cloud backup / sync
- [ ] Widgets
- [ ] Reminders and notifications
- [ ] Tests
- [ ] CI (lint + build on PR)

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push and open a PR

## License

Add a license (MIT is a common default) and reference it here.

## Author

**Abhijit Birle** — [@Abhijit-Birle](https://github.com/Abhijit-Birle)
