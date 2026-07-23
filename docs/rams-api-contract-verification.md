# Verifikasi Kontrak API RAMS

Dokumen ini mencatat kontrak integrasi berdasarkan `RAMS_Backend_API_Documentation.md` yang diterima pada 13 Juli 2026. Verifikasi runtime tetap diperlukan ketika RAMS Backend berjalan di `http://localhost:8000`.

Status verifikasi runtime pada 13 Juli 2026: backend tidak sedang mendengarkan pada port `8000`, sehingga fase ini memverifikasi kontrak dokumentasi dan menunda smoke test respons aktual.

## Base URL dan autentikasi

```text
RAMS_BACKEND_URL=http://localhost:8000
API prefix=/api/v1
Authorization=Bearer <access_token>
```

Endpoint publik:

- `GET /health`
- `GET /api/v1/system/health`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/register`

Endpoint lain memerlukan Bearer token. Browser tidak akan memanggil RAMS secara langsung; Next.js BFF akan menambahkan header autentikasi.

## Matriks endpoint terverifikasi dari dokumentasi

| Modul | Method dan endpoint | Wrapper respons | Query/body utama |
| --- | --- | --- | --- |
| Auth | `POST /auth/login` | object token + `user` | `username`, `password` |
| Auth | `POST /auth/refresh` | object token | `refresh_token` |
| Auth | `POST /auth/register` | user object | username, name, email, password |
| Auth | `GET /auth/me` | user object | - |
| Auth | `POST /auth/logout` | `{ ok }` | - |
| Auth | `GET /auth/users` | array user | ADMIN |
| Auth | `POST /auth/users` | user object | data user dan role |
| Auth | `PATCH /auth/users/{id}` | user object | email, name, role, is_active |
| Auth | `PATCH /auth/users/{id}/password` | `{ ok, message }` | password |
| System | `GET /system/health` | `{ ok, app, env }` | publik |
| System | `GET /system/database-health` | object metrik database | - |
| Frontend | `GET /frontend/state` | aggregate object | - |
| Frontend | `GET /frontend/maps` | `{ ok, generated_at, items }` | trainset |
| Frontend | `GET /frontend/trainsets` | paginated `{ items }` | search, limit, offset |
| Frontend | `GET /frontend/subsystems/ac` | `{ ok, filters, items }` | trainset, car |
| Frontend | `GET /frontend/subsystems/pressure-brake` | `{ ok, filters, items }` | trainset, car |
| Frontend | `GET /frontend/alarms/active` | `{ ok, filters, items }` | trainset, car, subsystem, priority, limit |
| Health | `GET /frontend/subsystem-health-state` | `{ ok, filters, count, items }` | trainset, car_id, subsystem |
| Monitoring | `GET /frontend/condition-monitoring` | context + health + signals + rules | trainset, car_id, subsystem wajib |
| Car health | `GET /frontend/car-health-state` | `{ ok, filters, count, items }` | trainset, car_id |
| Trainset health | `GET /frontend/trainset-health-state` | `{ ok, filters, count, items }` | trainset |
| Trainsets | `GET /trainsets` | `{ ok, trains }` | - |
| Trainsets | `GET /trainsets/{id}` | `{ ok, train }` | trainset ID |
| Trainsets | `GET /trainsets/{id}/cars/{car_id}` | `{ ok, car }` | backend IDs |
| Telemetry | `GET /telemetry/latest` | `{ ok, items }` | limit |
| Telemetry | `GET /telemetry/history` | `{ ok, items }` | trainset_id, car_id, subsystem, signal_name, limit |
| Alarms | `GET /alarms` | `{ ok, items }` | status, limit |
| Alarms | `POST /alarms/{id}/ack` | `{ ok, alarm }` | optional `x-admin-token` |
| Alarms | `POST /alarms/{id}/resolve` | `{ ok, alarm }` | optional `x-admin-token` |
| Insights | `GET /insights` | `{ ok, items }` | limit |
| Insights | `POST /insights/refresh` | `{ ok, created, items }` | limit, subsystem, trainset |
| Predictive | `GET /predictive` | `{ ok, items }` | limit |
| Predictive | `POST /predictive/refresh` | `{ ok, created }` | - |
| LLM | `POST /llm/recommendation` | `{ ok, recommendation }` | context alarm/event |
| MQTT | `GET /mqtt/status` | `{ ok, mqtt }` | - |
| Rules | `GET /rules` | `{ ok, filters, count, items }` | subsystem, enabled, source, level |
| Dev | `POST /dev/ingest` | processing result | ADMIN, development only |
| General | `GET /health` | `{ ok, app, version }` | publik |

Semua endpoint dalam tabel memakai prefix `/api/v1`, kecuali `/health`.

## Skala, unit, dan waktu

| Nilai | Kontrak dokumentasi | Normalisasi frontend |
| --- | --- | --- |
| `risk_score` | contoh `0.72` | skala 0-1, tampilkan 72% setelah validasi runtime |
| `confidence_score` | contoh `0.8` | skala 0-1, tampilkan 80% setelah validasi runtime |
| Brake Pipe/Cylinder | contoh unit `bar` | gunakan field `unit` jika tersedia |
| Speed | `speed_kph` | km/jam |
| Timestamp | ISO 8601 berakhiran `Z` pada contoh | parse UTC dan tampilkan zona pengguna |
| Latitude/longitude | number pada contoh | nullable belum dijelaskan; adapter wajib defensif |
| Car ID | string pada contoh | gunakan backend ID untuk query/route |

Nilai AC seperti suhu dan humidity tidak membawa field unit pada contoh dokumentasi. UI tidak boleh menambahkan simbol unit sebelum kontrak runtime dikonfirmasi.

## Enum yang didokumentasikan

```text
User role: ADMIN | TECHNICIAN | VIEWER
Alarm: ACTIVE | ACKED | RESOLVED
Severity/rule level: CRITICAL | WARNING | WATCH | INFO
Connection/data: ONLINE dan status lain harus diverifikasi runtime
Predictive: HIGH_RISK pada contoh; daftar lengkap belum didokumentasikan
Quality: GOOD pada contoh; daftar lengkap belum didokumentasikan
LLM status: FALLBACK pada contoh; daftar lengkap belum didokumentasikan
```

`AUTO_CLEARED` tidak termasuk kontrak live dan hanya digunakan dalam Dummy Mode.

## Field yang belum tersedia

Backend saat ini belum mendokumentasikan data berikut:

- Alias `TS-001` dan `C1`.
- Nama rute dan nama lokasi.
- Position history dan playback 24 jam.
- Health-score history.
- Validasi operator dan audit validasi insight.
- Breakdown confidence dan similar cases.
- TTW, predictive confidence, forecast, dan feature contribution.
- SPK, teknisi, assignment, jadwal inspeksi, dan email.
- Laporan, arsip, PDF, dan Excel.
- WebSocket status dan reconnect MQTT.
- Mutasi atau refresh rules.
- Filter telemetry `from` dan `to`.

Fitur tersebut harus memakai status `DUMMY`, `LOCAL`, `PROTOTYPE`, atau `BACKEND REQUIRED`.

## Kebijakan error dan fallback

- `401`: BFF mencoba refresh tepat satu kali, lalu mengulang request satu kali.
- Refresh gagal: hapus cookie sesi dan arahkan ke `/login`.
- `403`: tampilkan pesan tidak memiliki izin; jangan refresh token.
- `422`: normalisasi array detail validasi menjadi pesan field.
- Live Mode gagal: gunakan last successful live data jika ada.
- Live Mode tidak pernah silent fallback ke dummy.
- Dummy Mode tidak melakukan request RAMS.

## Verifikasi runtime yang masih harus dilakukan

Ketika backend tersedia, jalankan smoke test untuk memastikan:

- Base URL dan CORS internal BFF.
- Exact wrapper setiap endpoint.
- Nullability latitude, longitude, car ID, dan nested fields.
- Daftar lengkap enum.
- Skala risk dan confidence.
- Unit AC dan pressure.
- Timezone aktual.
- Bentuk error `400`, `401`, `403`, `404`, dan `422`.
- Apakah refresh token dirotasi pada setiap refresh.
- Apakah logout membutuhkan refresh token pada body.
