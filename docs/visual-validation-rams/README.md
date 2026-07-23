# Validasi Visual Integrasi RAMS

Validasi dilakukan pada viewport 1440 x 900 untuk skala 50%, 75%, dan 100%.

- Seluruh 11 route berhasil dirender tanpa 404 pada ketiga skala (33 pemeriksaan route).
- Skala 50% memenuhi satu viewport: tinggi client dan scroll sama pada `body` dan `main`.
- Screenshot Overview dan Sensor mentah disimpan untuk setiap skala.
- Validasi memakai Dummy Mode karena backend RAMS belum aktif; perilaku Live Mode divalidasi melalui unit test dan tetap memerlukan smoke test runtime.

