# Deployment Configuration

## Environment Variables

### Frontend (.env.local)
```bash
# FastAPI Backend URL
# For local development: http://localhost:8000
# For production: https://your-backend-url.up.railway.app
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Backend (.env)
```bash
# Project Configuration
PROJECT_NAME="Visual CRM"
PROJECT_VERSION="1.0.0"
DEBUG=true

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_V1_PREFIX=/api/v1

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Supabase Configuration (Backend only)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-here

# Environment
ENVIRONMENT=development
PYTHON_ENV=development  # Set to "production" in Railway
```

## Deployment Platforms

### Frontend: Vercel
- Uses `vercel.json` to specify `frontend/` as root directory
- Automatically deploys from `main` branch
- Configure `NEXT_PUBLIC_API_BASE_URL` in Vercel dashboard

### Backend: Railway
- Uses `backend/Dockerfile` for containerization
- Deployed via GitHub Actions on backend changes
- Configure environment variables in Railway dashboard
- GitHub Secrets required: `RAILWAY_API_TOKEN`, `RAILWAY_PROJECT_ID`

## CI/CD Workflows
- `.github/workflows/backend.yml` - Automated Railway deployment
- Triggers on changes to `backend/**` files
- Deploys to Railway service named "api"

## Docker Configuration
- `backend/Dockerfile` uses Python 3.12-slim
- Installs dependencies from `requirements.txt`
- Runs on port 8000 with uvicorn