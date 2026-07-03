# TEL-U Insight System

Frontend dashboard untuk RAMS Rail Assets Monitoring System. Scope TEL-U pada repository ini adalah UI/UX, dashboard, report, visualisasi trend, alert, mobile responsive view, dan tampilan insight dari backend.

## Struktur

- `frontend/` berisi Next.js dashboard.
- `frontend/src/dummy/` berisi dummy data sementara.
- `frontend/src/services/` menjadi satu-satunya layer yang membaca dummy atau API backend.
- `frontend/src/hooks/` disediakan untuk client component yang membutuhkan loading/error state.
- UI component mengikuti pola shadcn dengan Radix/CVA, ikon memakai Phosphor Icons, dan peta memakai MapLibre.
- `backend/` hanya placeholder integrasi.
- `docs/` berisi catatan arsitektur, kontrak API awal, dan open questions.

## Menjalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Default environment:

```env
NEXT_PUBLIC_USE_DUMMY=true
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Saat API REKA tersedia, ubah `NEXT_PUBLIC_USE_DUMMY=false` dan sesuaikan `NEXT_PUBLIC_API_URL`.
