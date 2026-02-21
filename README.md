# Ngaji Quran (Production-ready) - Quran.com API + Premium Typography
## Backend: Enterprise structure (Routes/Controllers/Services) + Knex + SQLite

Monorepo:
- **backend/**: Node.js (Express + TypeScript) - Knex + SQLite, **modular**: routes/controllers/services/repository
- **frontend/**: Vite + React + TypeScript - UI premium (light), PWA siap install

## Quick Start (Dev)

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
Backend: `http://localhost:8080`

> DB migrations dijalankan otomatis saat server start.
> Kalau mau manual: `npm run db:migrate`

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend: `http://localhost:5173`

## Production
### Backend
```bash
cd backend
npm install
npm run build
npm run start
```

### Frontend
```bash
cd frontend
npm install
npm run build
npm run preview
```

### PM2 (recommended)
```bash
# Backend
cd backend
npm run build
pm2 start ecosystem.config.cjs

# Frontend (preview server)
cd frontend
npm run build
pm2 start ecosystem.config.cjs
```

> Frontend preview default: `http://0.0.0.0:4173`

## Backend Structure
```
backend/src/
  config/
  database/
  middlewares/
  modules/
    quran/
    user/
  app.ts
  server.ts
```
