# Deployment Plan – Visual Server Actions (Beta)

> **UPDATE (June 16 2025):** For this beta we will **skip custom domains** and instead use the provider‑generated URLs from Vercel and Railway.

> **Scope**: deploy the *FastAPI* backend and *Next .js 15* frontend to EU‑hosted PaaS targets, wire them together, and mount a custom domain – *no auth or full‑blown observability yet, just an MVP ship*.

---

## 1. Prerequisites

| What                | Version / Notes                                   |
| ------------------- | ------------------------------------------------- |
| Node.js             |  ≥ 20 (matches Vercel default runtime)            |
| Python              |  ≥ 3.12                                           |
| Docker Desktop      |  for local image builds & Railway deployment      |
| GitHub repo         |  Monorepo with `frontend/` and `backend/` folders |
| Supabase Cloud (EU) |  Project + service key (already created)          |
| Vercel account      |  Team or Personal • EU regions allowed            |
| Railway account     |  Pro plan required for region selection           |

---

## 2. Repository layout

```text
visual-server-actions/
├─ frontend/            # Next 15 app
├─ backend/             # FastAPI app
│  └─ Dockerfile        # added below
└─ .github/
    └─ workflows/
        └─ backend.yml  # GitHub Actions for Railway
```

*No separate repos are needed – Vercel & Railway can both target a sub‑directory build.*

---

## 3. Frontend → **Vercel** (EU edge)

1. **Create Project**  → *Import Git* → select monorepo → set **Root Dir** = `frontend/`.
2. **Build & Output**  – Vercel auto‑detects Next .js; no extra config needed.
3. **Environment Variables**  *(Preview & Production)*

   | Name                  | Value                                |
   | --------------------- | ------------------------------------ |
   | `NEXT_PUBLIC_API_URL` | `https://api.<your‑domain>` (see §5) |
   | `SUPABASE_URL`        | from Supabase                        |
   | `SUPABASE_ANON_KEY`   | from Supabase                        |
4. **Edge Region** – add per‑route config if server actions must stay inside the EU:

   ```ts
   // app/page.tsx (or a parent route)
   export const preferredRegion = ["fra1", "arn1", "dub1"]; // EU‑only
   ```

   As documented by Vercel citeturn0search4.
5. **Deploy** – every push to `main` triggers a build; Vercel provides immutable preview builds on PRs automatically.

---

## 4. Backend → **Railway** (EU West)

### 4.1 Create service

1. *New Project* → **Deploy from GitHub** → pick repo, **Subdirectory** = `backend/`.
2. Choose **Region** → `EU West – Amsterdam (europe‑west4)` citeturn11view0.
3. **Variables** – mirror Supabase creds plus `PYTHON_ENV=production`.

### 4.2 Dockerfile (in `backend/`)

```dockerfile
# --- base image & layer caching
FROM python:3.12-slim AS base
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# --- deps layer
COPY backend/requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# --- copy source & run
COPY backend/ ./
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

> **Why Docker?**  Railway converts this file into an image that contains *exactly* the Python version, OS libraries, and dependencies your FastAPI service needs. The same artifact runs locally, in CI, and in prod – eliminating "works on my machine" drift. See Appendix A for more.

### 4.3 GitHub Actions – `.github/workflows/backend.yml`

```yaml
name: Build & Deploy (Railway)

on:
  push:
    paths: ["backend/**"]
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: railwayapp/railway-deploy-action@v2
        with:
          railwayToken: ${{ secrets.RAILWAY_API_TOKEN }}
          projectId:    ${{ secrets.RAILWAY_PROJECT_ID }}
          serviceName:  api
          cwd: backend
```

Railway still auto‑builds on push; this Action makes build+deploy explicit and enables *checks* / *rollbacks* in PRs.

---

## 5. URLs & Routing (no custom domains)

For the beta we will **stick with the provider‑generated URLs** and skip any DNS work:

| Layer                 | URL you will get                                               | Action items                                                                  |
| --------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Frontend (Vercel)** | e.g. `https://visual-server-actions.vercel.app`                | Nothing to change – Vercel shows the live link after the first deploy.        |
| **Backend (Railway)** | e.g. `https://visual-server-actions-production.up.railway.app` | Copy this value into Vercel → **Environment Variable** `NEXT_PUBLIC_API_URL`. |

### CORS

During beta the FastAPI `allow_origins=["*"]` setting is acceptable because the service is internal‑only. Revisit once you enable auth.

---

## 6. Smoke test checklist. Smoke test checklist

1. `curl https://api.your‑domain.com/health` → `{ "status": "ok" }`.
2. Open `app.your‑domain.com` in browser; customers table should load.
3. Create a dummy customer → confirm Supabase row and UI update.

---

## 7. Appendix A – **What Docker does in this setup**

| Concern                 | How Docker helps                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Reproducible builds** | The `requirements.txt` is baked into its own layer; installs are cached, and every build uses identical versions. |
| **Isolation**           | Packages won’t leak into the host OS; the container is a self‑contained filesystem.                               |
| **Portability**         | The image runs the same on your laptop, in GitHub Actions, and on Railway’s runtime.                              |
| **Rollback**            | Railway keeps previous images; switching is instant vs. re‑installing deps.                                       |

Railway *can* auto‑detect FastAPI without a Dockerfile, but pinning one gives you predictable Python versions and allows use of system libs (e.g. `libpq` if you move from Supabase’s HTTP client to `asyncpg`).

---

## 8. Next steps (post‑MVP)

* Add Supabase JWT auth + `@fastapi.middleware` guards.
* Write Playwright tests and include them in the GitHub workflow.
* Add basic logging/metrics via Railway’s *Logs* tab and Vercel’s *Analytics*.

---

> **Done!**  Follow the sections top‑to‑bottom and your beta should be live in minutes. Happy shipping \:rocket:
