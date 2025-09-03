## Render (recommended for quick prod test)

1. Backend (Web Service)
   - Root: `backend`
   - Build: `npm ci`
   - Start: `node src/app.js`
   - Health check: `/health`
   - Disk: 1 GB mounted at `/app/data`
   - Env: `NODE_ENV=production`, `PORT=10000`, `DATABASE_URL=sqlite:/app/data/prod.sqlite`, `JWT_SECRET=<random>`, `OPENAI_API_KEY=<key>` (optional)

2. Frontend (Static Site)
   - Root: `frontend`
   - Build: `npm ci && npm run build`
   - Publish: `build`
   - Env: `REACT_APP_API_URL=https://<backend-host>`

## Docker (single VM)

Compose:
```
export JWT_SECRET=$(openssl rand -hex 32)
export OPENAI_API_KEY=YOUR_KEY   # optional
docker compose up -d --build
```
Frontend: http://localhost:3000 — Backend: http://localhost:4000/health

Prod-like:
```
docker volume create meeting_data
docker build -t meeting-backend ./backend
docker run -d --name meeting-backend -p 4000:4000 \
  -v meeting_data:/app/data \
  -e NODE_ENV=production -e PORT=4000 \
  -e DATABASE_URL=sqlite:/app/data/prod.sqlite \
  -e JWT_SECRET=$JWT_SECRET -e OPENAI_API_KEY=$OPENAI_API_KEY \
  meeting-backend

docker build -f frontend/Dockerfile.prod -t meeting-frontend \
  --build-arg REACT_APP_API_URL=http://localhost:4000 ./frontend
docker run -d --name meeting-frontend -p 3000:80 meeting-frontend
```

