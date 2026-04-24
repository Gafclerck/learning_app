FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# On utilise un script de démarrage qui :
# 1. Lance les migrations Alembic
# 2. Démarre l'API
CMD ["bash", "start.sh"]
