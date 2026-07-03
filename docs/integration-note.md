# Integration Note

Saat API REKA tersedia:

1. Ubah `NEXT_PUBLIC_USE_DUMMY=false`.
2. Ubah `NEXT_PUBLIC_API_URL` ke base URL backend.
3. Sesuaikan parser response pada service jika struktur API final berbeda.
4. Pastikan komponen tetap tidak mengakses dummy secara langsung.
