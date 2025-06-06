# OptiCRM FastAPI Backend

FastAPI backend for OptiCRM - Optician Customer Relationship Management system.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Environment configuration:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Run the development server:**
   ```bash
   cd app
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Documentation

Once running, visit:
- **Interactive API docs:** http://localhost:8000/docs
- **Alternative docs:** http://localhost:8000/redoc

## Health Checks

- **Basic health:** `GET /api/v1/health`
- **Database health:** `GET /api/v1/health/database`

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── database.py          # Supabase connection
│   ├── api/
│   │   ├── dependencies.py  # Shared dependencies
│   │   └── routes/          # API route modules
│   ├── models/              # Pydantic models
│   └── schemas/             # Database schemas
├── requirements.txt
└── .env.example
```