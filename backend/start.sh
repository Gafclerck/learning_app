#!/bin/bash

echo ">>> Running Alembic migrations..."
alembic upgrade head

if [ $? -ne 0 ]; then
  echo "!!! Migrations failed. Aborting."
  exit 1
fi

echo ">>> Creating initial data (superuser)..."
python -m app.initial_data

if [ $? -ne 0 ]; then
  echo "!!! Initial data creation failed. Aborting."
  exit 1
fi

echo ">>> Starting FastAPI server..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1
