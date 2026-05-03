# LearnFast

A modern AI-powered e-learning platform built for structured learning and user progression.

**Live Demo:** [https://learnfast-olive.vercel.app](https://learnfast-olive.vercel.app)
**API Docs:** [https://e-learning-n6ah.onrender.com/docs](https://e-learning-n6ah.onrender.com/docs)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy, PostgreSQL, pgvector |
| Frontend | React 19, Vite, Tailwind CSS v4, Zustand |
| AI | fastembed (sentence embeddings) |
| Payments | Stripe (test mode) |
| Realtime | WebSocket |
| Database | Supabase (PostgreSQL) |
| Deployment | Render (API) · Vercel (Frontend) |

---

## Features

- JWT authentication with role-based access (student / teacher / admin)
- Roadmap-style course progression with locked/unlocked lessons
- AI-powered course recommendations via vector embeddings
- Real-time chat (course group chat + private messages)
- Stripe payment integration (test mode)
- Teacher request & approval flow
- Admin dashboard for user management

---

## Project Structure

```
Task2/
├── backend/    → FastAPI REST API
└── frontend/   → React SPA
```

See `backend/README.md` and `frontend/README.md` for setup instructions.
