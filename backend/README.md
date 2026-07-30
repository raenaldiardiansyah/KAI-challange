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
