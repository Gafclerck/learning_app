# Frontend — LearnFast

**Live:** [https://learnfast-olive.vercel.app](https://learnfast-olive.vercel.app)

---

## Tech

- **React 19** — UI library
- **Vite** — build tool
- **Tailwind CSS v4** — utility-first styling
- **Zustand** — global state management
- **Axios** — HTTP client with JWT interceptor
- **React Router v7** — client-side routing

---

## Local Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo "VITE_API_URL=http://localhost:8000" > .env

# Start dev server
npm run dev
```

App available at `http://localhost:5173`

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## Structure

```
src/
├── pages/          → One file per route
├── components/
│   ├── layout/     → Navbar, Layout, ProtectedRoute
│   ├── ui/         → Reusable components (Button, Spinner...)
│   └── features/   → Domain-specific components
├── modules/
│   └── chat/       → Self-contained chat module (hooks, store, components)
├── services/       → All API calls (Axios)
└── store/          → Zustand global stores
```

---

## Build

```bash
npm run build   # Output in /dist
npm run preview # Preview production build locally
```
