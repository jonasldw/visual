# --- base image & layer caching
FROM python:3.12-slim AS base
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# --- deps layer
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# --- copy source & run
COPY . ./
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]