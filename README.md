# Konto — Universal Mobile Utility App

All-in-one personal utility app for Android and iOS. Notes, expenses, todos, timers, and AI insights in one place. Built with React + Vite, packaged for mobile with Capacitor.

> **Status:** Work in progress.
> <img width="1440" height="2304" alt="Screenshot_20261116_003413_Konto" src="https://github.com/user-attachments/assets/1c6488b9-6251-40f5-adfe-c9e02533f9dd" />
<img width="1440" height="2304" alt="Screenshot_20261116_003523_Konto" src="https://github.com/user-attachments/assets/420a5a83-5cd5-48e4-97b4-d1f05c779b3c" />
<img width="1440" height="2304" alt="Screenshot_20261116_003540_Konto" src="https://github.com/user-attachments/assets/7da4a4bf-5df4-4a44-b43a-001443224dbb" />
<img width="1440" height="2304" alt="Screenshot_20261116_003559_Konto" src="https://github.com/user-attachments/assets/2091d42f-ecc3-4351-80bb-9b6cb8f7960f" />
<img width="1440" height="2304" alt="Screenshot_20261116_003610_Konto" src="https://github.com/user-attachments/assets/40629a3e-1253-488c-b9c9-ee2805de12cc" />
<img width="1440" height="2304" alt="Screenshot_20261116_003619_Konto" src="https://github.com/user-attachments/assets/7d5e54a6-173e-4615-a89d-e026a4ab576e" />
<img width="1440" height="2304" alt="Screenshot_20261116_003623_Konto" src="https://github.com/user-attachments/assets/945db472-c60f-4d65-9ce0-4e45426316ad" />
<img width="1440" height="2304" alt="Screenshot_20261116_003629_Konto" src="https://github.com/user-attachments/assets/c275eda9-06e5-4e03-a569-b4a5b8df4ea9" />
<img width="1440" height="2304" alt="Screenshot_20261116_003647_Konto" src="https://github.com/user-attachments/assets/eea28124-2c52-4dca-9686-abf5ed79c15a" />
<img width="1440" height="2304" alt="Screenshot_20261116_003728_Konto" src="https://github.com/user-attachments/assets/9e065647-7215-492c-907a-d065e3951c9a" />
<img width="1440" height="2304" alt="Screenshot_20261116_003744_Konto" src="https://github.com/user-attachments/assets/97c4c7e7-cf44-4ce6-83ac-3d74b5af2625" />
<img width="1440" height="2304" alt="Screenshot_20261116_003754_Konto" src="https://github.com/user-attachments/assets/cc6a325f-279f-4cbd-87d6-abb65a6a03e0" />
<img width="1440" height="2304" alt="Screenshot_20261116_003808_Konto" src="https://github.com/user-attachments/assets/f5e84671-d5b2-4ab0-a80a-5b31e677ef75" />
<img width="1440" height="2304" alt="Screenshot_20261116_003821_Konto" src="https://github.com/user-attachments/assets/e893063c-19bb-4a4c-b022-9aa7cb4cd98a" />

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
