# KAI RAMS Authentication API

Backend FastAPI untuk login internal menggunakan username dan password. Data akun
disimpan di PostgreSQL Supabase; Supabase Auth tidak digunakan.

## Menjalankan lokal

```powershell
cd D:\Downloads\KAI\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Konfigurasi lokal disimpan di `.env` berdasarkan `.env.example`. File `.env`
diabaikan oleh Git dan tidak boleh berisi placeholder saat aplikasi dijalankan.

## Membuat akun

```powershell
python -m scripts.create_user --username operator_kai --name "Operator KAI" --role ADMIN
```

## Endpoint

```text
POST /api/v1/auth/login
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
POST /api/v1/auth/logout
GET  /health
```

Deployment Render dikonfigurasi melalui `render.yaml` pada root repository.

## Deploy ke Vercel

Backend juga dapat dijalankan sebagai project Vercel terpisah:

1. Import repository yang sama sebagai project baru.
2. Atur **Root Directory** ke `backend`.
3. Biarkan Framework Preset terdeteksi sebagai FastAPI atau pilih **Other**.
4. Jangan isi Build Command, Output Directory, maupun Install Command.
5. Tambahkan environment variable `APP_ENV`, `DATABASE_URL`,
   `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, dan `CORS_ORIGINS`.

Vercel memuat aplikasi melalui `backend/index.py`. Migration database tetap
dijalankan dari mesin lokal dengan `alembic upgrade head` sebelum deployment.
