# Ngaji Quran (Production-ready) - Quran.com API + Premium Typography
## Backend: Enterprise structure (Routes/Controllers/Services) + Knex + MySQL

Monorepo:
- **backend/**: Node.js (Express + TypeScript) - Knex + MySQL, **modular**: routes/controllers/services/repository
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

## Database Notes
- Backend menggunakan **MySQL**
- Jalankan migration:
```bash
npm run db:migrate:mysql
```
- Cek status migration:
```bash
npm run db:status
```

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
pm2 startOrReload ecosystem.config.cjs --update-env

# Frontend (preview server)
cd frontend
npm run build
pm2 startOrReload ecosystem.config.cjs --update-env
```

> Frontend preview default: `http://0.0.0.0:4173`

## CI/CD (GitHub Actions)
Workflow tersedia di:
- `.github/workflows/main.yml`

Trigger:
- Push ke branch `main`

Flow deploy:
1. Checkout source
2. Connect ke Tailscale
3. SSH ke server
4. `git pull origin main`
5. Build + reload PM2 untuk backend dan frontend

GitHub Secrets yang wajib diset:
- `TAILSCALE_AUTHKEY`
- `SSH_HOST`
- `SSH_USERNAME`
- `SSH_PRIVATE_KEY`

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
