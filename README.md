# Konto

A personal all-in-one utility app for Android and iOS — notes, expenses, todos, timers, and a little AI on the side.

Built for fun, mostly to see how far a single React codebase can go as a real mobile app.

<p align="center">
  <img src="docs/screenshots/home.png" width="180" alt="Home" />
  <img src="docs/screenshots/notes.png" width="180" alt="Notes" />
  <img src="docs/screenshots/expenses.png" width="180" alt="Expenses" />
  <img src="docs/screenshots/todo.png" width="180" alt="Todo" />
</p>

<details>
<summary>More screenshots</summary>
<br />
<p align="center">
  <img src="docs/screenshots/timer.png" width="180" alt="Timer" />
  <img src="docs/screenshots/zen.png" width="180" alt="Zen" />
  <img src="docs/screenshots/insights.png" width="180" alt="AI Insights" />
</p>
</details>

## Why I built this

I wanted one app for the small things I use daily instead of juggling five. It also became a playground: native packaging with Capacitor, smooth animations, a bit of 3D, and Gemini for insights. A side project with no deadlines, so it's been a good place to try things.

> Hobby project. Things may be rough, and features change whenever I feel like tinkering.

## What's inside

- **Notes** with a code-friendly editor
- **Expenses** with charts and Excel export
- **Todos**
- **Timer and Zen** for focus and breathing
- **AI Insights** powered by Gemini
- Offline-first, data stays on the device
- Haptics and native share sheet

## Built with

React 19 · Vite · TypeScript · Capacitor · Framer Motion · GSAP · Three.js / React Three Fiber · Recharts · Google Gemini · SheetJS

## Things I enjoyed figuring out

<!-- Edit with your real learnings -->
- Shipping a web app to Android and iOS with Capacitor
- Keeping animations smooth on mobile with WebGL in the mix
- Storing everything locally without a backend

## Run it

```bash
git clone https://github.com/Abhijit-Birle/universal-mobile-utility-app.git
cd universal-mobile-utility-app
npm install
npm run dev
```

For AI features, add a `.env` file:

```env
VITE_GEMINI_API_KEY=your_key_here
```

> `VITE_*` keys end up in the client bundle. Fine for personal use, not for a public release.

On a device:

```bash
npm run build
npx cap sync
npx cap open android   # or: npx cap open ios
```

## What's next (maybe)

Cloud backup, reminders, widgets. No promises.

## Author

**Abhijit Birle** · [GitHub](https://github.com/Abhijit-Birle)
