# Ngaji Quran (Production-ready) — Quran.com API + Premium Typography
## Backend: Enterprise structure (Routes/Controllers/Services) + Knex + SQLite

Monorepo:
- **backend/**: Node.js (Express + TypeScript) — Knex + SQLite, **modular**: routes/controllers/services/repository
- **frontend/**: Vite + React + TypeScript — UI premium (light), PWA siap install

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


## True Mushaf Mode
- Read page uses Quran.com words + line_number + code_v2 to render 15-line mushaf layout.
- Put font `frontend/public/fonts/UthmanicHafs.woff2` for best results.


## Troubleshooting: Blank page in True Mushaf
- If the page is blank, check **Network** tab for `UthmanicHafs.woff2/.ttf` must be **200 OK**.
- Open `/api/quran/page?pageNumber=1&words=true` and ensure verses contain `words[].code_v2` and `words[].line_number`.
- If glyphs still don't render, the font is likely not compatible with Quran.com `code_v2` mapping.
