FROM python:3.11-slim

# Install system deps (for psycopg2, cx_Oracle, pymssql)
RUN apt-get update && apt-get install -y \
    gcc g++ libpq-dev freetds-dev freetds-bin unixodbc-dev curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Start server (schema handled by database/init.sql)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
