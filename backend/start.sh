#!/bin/bash

# Script de démarrage production
# S'exécute à chaque démarrage du container

echo ">>> Running Alembic migrations..."
alembic upgrade head

# Si les migrations échouent, on arrête tout
# Le $? contient le code de retour de la dernière commande
if [ $? -ne 0 ]; then
  echo "!!! Migrations failed. Aborting."
  exit 1
fi

echo ">>> Starting FastAPI server..."
# workers = nombre de processus parallèles
# Sur le plan gratuit Render = 1 suffit
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1
