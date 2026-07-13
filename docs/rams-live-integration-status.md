# Status Implementasi Integrasi Data RAMS

Tanggal audit: 13 Juli 2026.

Implementasi kontrak frontend telah selesai secara statis dan melalui unit test. Pengujian integrasi runtime Live Mode masih **pending** karena RAMS Backend di `http://localhost:8000` belum aktif. Dokumen ini tidak menyatakan endpoint live sudah berhasil diuji langsung.

## Jalur data yang sudah diimplementasikan

| Area | Endpoint produksi | Status |
| --- | --- | --- |
| Overview | `GET /frontend/state` | Diimplementasikan |
| Armada | `GET /frontend/trainsets`, `GET /trainsets` | Diimplementasikan |
| Gerbong | `GET /trainsets/{trainset_id}/cars/{car_id}` dan health/condition endpoints | Diimplementasikan |
| Sensor mentah | `GET /telemetry/latest`, `GET /telemetry/history` | Diimplementasikan |
| Alarm | `GET /alarms`, `GET /frontend/alarms/active` | Diimplementasikan |
| Aksi alarm | `POST /alarms/{id}/ack`, `POST /alarms/{id}/resolve` | Diimplementasikan; refetch setelah sukses |
| Insight | `GET /insights` | Diimplementasikan |
| Prediktif | `GET /predictive` | Diimplementasikan |
| Pantauan | `GET /frontend/maps` | Diimplementasikan |
| Status sistem | `GET /system/health`, `GET /system/database-health`, `GET /mqtt/status` | Diimplementasikan |

Semua path di atas dipanggil melalui BFF `requestRams()` dengan prefix browser `/api/rams`. Wrapper `{ ok, trains }` dan `{ ok, items }` diparsing oleh adapter, bukan dianggap sebagai array langsung.

## Audit empat jalur kritis

- Settings menggunakan satu `DataModeProvider`; perubahan Dummy/Live berlaku pada resource halaman.
- Service produksi memanggil `requestRams()`, bukan client lama atau fetch langsung ke RAMS.
- Dummy Mode tidak menjalankan loader live. Live Mode hanya menerima live data, cache live terakhir yang ditandai stale, atau error/empty state; tidak ada fallback dummy diam-diam.
- Acknowledge/resolve alarm melakukan POST ke backend dan menjalankan refetch setelah respons berhasil; Live Mode tidak hanya mengubah state lokal.

## Identitas dan batas Prototype

Mapping eksplisit saat ini:

```text
KA_DATA_DUMMY -> TS-001
M102401       -> C1
```

Car yang tidak dikenal tidak diberi nomor berdasarkan urutan array. `AUTO_CLEARED` disaring dari respons live dan hanya tersedia pada data dummy.

SPK, laporan, EmailJS, histori health, TTW, proyeksi prediktif, dan field yang belum memiliki endpoint tetap Local/Prototype. Nilai tren yang tidak tersedia pada Live Mode tidak direkayasa.

## Validasi yang sudah dilakukan

- Unit test: parsing wrapper, deduplikasi GET, mapping identitas, adapter Overview, alarm ack/resolve, dan perilaku Dummy/Live tanpa fallback.
- Typecheck dan production build.
- Pemeriksaan 11 route pada skala 50%, 75%, dan 100% di viewport 1440 x 900; tidak ada 404.
- Pada skala 50%, `main` dan `body` tidak memiliki overflow vertikal pada seluruh 11 route.

Bukti visual tersimpan di `docs/visual-validation-rams/`.

## Pending ketika backend aktif

- Smoke test login dan semua endpoint terhadap payload aktual.
- Konfirmasi nullability, enum, unit, timestamp, serta skala risk/confidence.
- Verifikasi langsung bahwa mutation ack/resolve mengubah data RAMS dan hasil refetch menampilkan status baru.
- Pengujian cache live terakhir dan respons error HTTP aktual.

