# Backend — LearnFast API

**Base URL (production):** [https://e-learning-n6ah.onrender.com](https://e-learning-n6ah.onrender.com)
**Interactive docs:** [https://e-learning-n6ah.onrender.com/docs](https://e-learning-n6ah.onrender.com/docs)

---

## Tech

- **FastAPI** — REST API + WebSocket
- **SQLAlchemy 2** — ORM with async-ready models
- **PostgreSQL + pgvector** — relational DB + vector search
- **Alembic** — database migrations
- **fastembed** — lightweight sentence embeddings for AI recommendations
- **Stripe** — payment integration (test mode)
- **pwdlib / argon2** — password hashing
- **PyJWT** — JWT authentication

---

## Local Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your values

# Run migrations
alembic upgrade head

# Create first admin user
python -m app.initial_data

# Start server
uvicorn app.main:app --reload
```

API available at `http://localhost:8000`
Docs at `http://localhost:8000/docs`

---

## Environment Variables

| Variable                      | Description                  |
| ----------------------------- | ---------------------------- |
| `DATABASE_URL`                | PostgreSQL connection string |
| `SECRET_KEY`                  | JWT signing secret           |
| `ALGORITHM`                   | JWT algorithm (HS256)        |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry                 |
| `FIRST_SUPERUSER`             | Admin email                  |
| `FIRST_SUPERUSER_PASSWORD`    | Admin password               |
| `STRIPE_SECRET_KEY`           | Stripe secret key            |
| `STRIPE_PUBLISHABLE_KEY`      | Stripe publishable key       |
| `STRIPE_WEBHOOK_SECRET`       | Stripe webhook secret        |
| `FRONTEND_URL`                | Frontend URL for CORS        |

---

## API Overview

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/courses
GET    /api/courses/{id}
POST   /api/courses              (teacher)
PATCH  /api/courses/{id}         (teacher)

POST   /api/enrollments/{id}/enroll
GET    /api/enrollments/{id}/progress

WS     /chat/ws/course/{id}?token=...
WS     /chat/ws/private/{id}?token=...

POST   /api/teacher-requests
PATCH  /api/teacher-requests/{id}/approve   (admin)

GET    /api/users                (admin)
PATCH  /api/users/{id}           (admin)
```

## Docker

```bash
# Run with Docker Compose (includes PostgreSQL with pgvector)
docker compose up --build
```
