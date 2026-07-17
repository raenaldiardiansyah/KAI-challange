# Route and Interaction Audit

Tanggal audit: 11 Juli 2026

Scope:

- `frontend/src/app`
- `frontend/src/components/layout`
- `frontend/src/components/maps`
- `frontend/src/features`
- `frontend/src/constants/routes.ts`

Audit ini memeriksa tombol, link, row click, tab, filter, dialog, drawer, popup map, dan tombol export agar tidak ada elemen interaktif yang terlihat aktif tetapi tidak menghasilkan aksi.

## Route Utama

Route yang harus tetap hidup:

| Route | Status | Catatan |
| --- | --- | --- |
| `/overview` | Valid | Entry dashboard dan link judul Topbar. |
| `/trainset` | Valid | Link sidebar, summary, minimap route item, map popup. |
| `/car-detail` | Valid | Evidence dari Overview, Trainset, Alarm, dan Insight memakai query konteks. |
| `/insight-analytic` | Valid | Link sidebar, Overview, Live Monitoring. |
| `/predictive-maintenance` | Valid | Link sidebar dan summary card. |
| `/live-monitoring` | Valid | Minimap Overview mengarah ke route ini. |
| `/alarm-center` | Valid | Topbar bell, sidebar, Overview, map popup, Live Monitoring. |
| `/work-order` | Valid | Tombol SPK dari Overview, Alarm, Insight, Prediktif, dan Gerbong. |
| `/report-analytics` | Valid | Link sidebar Laporan. |
| `/settings` | Valid | Link sidebar Pengaturan. |
| `/telemetry-explorer` | Valid | Route tetap ada dan dipakai dari Live Monitoring sebagai Sensor Mentah. |

Catatan sidebar:

- `frontend/src/constants/routes.ts` saat audit berisi menu operasional yang sedang dipakai UI.
- Route `/telemetry-explorer` tetap ada dan dapat diakses dari action halaman, sementara data Telemetri juga sudah digabung ke halaman Laporan sesuai arahan penggabungan sebelumnya.
- Tidak ada route baru yang dibuat.

## Ringkasan Per Halaman

| Area | Elemen interaktif | Status |
| --- | --- | --- |
| Global layout | Sidebar links, Topbar title, bell, test koneksi | Valid. Sidebar route-safe, title ke `/overview`, bell ke `/alarm-center`, test koneksi membuka popover lokal. |
| Overview | Summary cards, insight action, minimap, rute prioritas, alarm preview | Valid. Minimap ke `/live-monitoring`; rute prioritas diperbaiki dari `?id=` menjadi `?trainset=`; Buat SPK membawa query konteks. |
| Trainset | List armada, pagination, composition car, heatmap subsystem | Valid. Klik aset memakai query ke `/trainset` atau `/car-detail`. |
| Car Detail | Filter gerbong, tab Ringkasan/Data Sensor/Tindakan, timeline dialog, Lihat Data Sensor, Buat SPK | Valid. Tab dan dialog lokal; Buat SPK membawa konteks ke `/work-order`. |
| Insight | Filter, stepper, bukti/root tabs, process dialog, validation, draft SPK | Valid setelah perbaikan. Filter gerbong kini memfilter data, Draft SPK membawa query konteks. |
| Predictive Maintenance | Search, filter sheet, risk cards, ranking, chart detail, queue menu, evidence dialog, SPK | Valid setelah perbaikan. Filter sheet tidak lagi pajangan; Buat SPK route ke `/work-order` dengan konteks. |
| Live Monitoring | Status filter, search, map controls, marker/card selection, detail links | Valid. Link detail ke Trainset, Gerbong, Alarm, Insight, Sensor Mentah. |
| Alarm Center | Search suggestion, dropdown filter, table row, acknowledge, Evidence, Buat SPK | Valid setelah perbaikan. Dropdown benar-benar memfilter, acknowledge update local state, route memakai konteks. |
| SPK | Form draft, reset, save, table filters, row action menu, status update, priority override | Valid. Export diberi status eksplisit menunggu backend. |
| Report Analytics | Filter, Generate Report, PDF/Excel simulation, chart toggles | Valid setelah perbaikan. Export tidak melakukan fake backend; status menunggu integrasi backend ditampilkan. |
| Settings | Scale preference buttons | Valid. Mengubah state/preference lokal. |

## Perbaikan Yang Dilakukan

| File | Perbaikan |
| --- | --- |
| `frontend/src/features/alarm/AlarmCenterWorkspace.tsx` | Menambahkan state filter armada/subsistem/severity/status dan override status acknowledge lokal. |
| `frontend/src/features/alarm/AlarmFilter.tsx` | Menyambungkan dropdown filter ke state, bukan lagi default select statis. |
| `frontend/src/features/alarm/AlarmTable.tsx` | Evidence dan Buat SPK membawa query konteks; acknowledge tidak lagi `alert()`. |
| `frontend/src/features/alarm/__tests__/AlarmTable.test.tsx` | Test acknowledge disesuaikan ke callback lokal. |
| `frontend/src/features/overview/PriorityInsightCard.tsx` | `Buat SPK` membawa konteks trainset/car/subsystem/source. |
| `frontend/src/features/overview/TrainPositionMap.tsx` | Link rute prioritas diperbaiki menjadi `/trainset?trainset=...`. |
| `frontend/src/features/insight/InsightWorkspace.tsx` | Filter Gerbong kini benar-benar memfilter insight; modal SPK membawa konteks. |
| `frontend/src/features/insight/InsightSummaryCard.tsx` | Draft SPK dan Tinjau Bukti memakai data insight aktif. |
| `frontend/src/features/insight/RecommendationPanel.tsx` | Buat Draft SPK membawa query konteks. |
| `frontend/src/features/insight/StructuredInsightViewer.tsx` | Draft SPK dari dialog proses membawa query konteks. |
| `frontend/src/features/predictive-maintenance/PredictiveMaintenanceWorkspace.tsx` | Filter sheet trainset/gerbong/subsistem/TTW/kualitas/status tersambung ke data; Buat SPK route dengan konteks. |
| `frontend/src/features/report/ReportFilter.tsx` | Generate Report menampilkan status preview dan export backend pending. |
| `frontend/src/features/report/ReportTable.tsx` | Tombol PDF/Excel menampilkan status menunggu backend, bukan dead click. |
| `frontend/src/features/report/ExportReportButton.tsx` | Komponen export standalone diberi aksi/status lokal. |
| `frontend/src/features/work-order/WorkOrderActionButton.tsx` | Menghapus `alert()` dan mengganti dengan status lokal. |
| `frontend/src/features/work-order/WorkOrderTable.tsx` | Export SPK menampilkan status menunggu integrasi backend. |
| `frontend/src/app/globals.css` | Style status inline untuk pesan export/request. |

## Kategori Hasil Audit

Route valid:

- Sidebar dan Topbar.
- Overview ke Insight, Gerbong, SPK, Pantauan, Alarm, Prediktif.
- Trainset ke Gerbong.
- Live Monitoring ke Trainset, Gerbong, Alarm, Insight, Sensor Mentah.
- Alarm/Insight/Prediktif/Gerbong ke SPK.

Interaksi lokal valid:

- Tab, filter, segmented control, pagination, row selection, status update, priority override, chart mode, map control, dan validation state.

Modal/drawer valid:

- Timeline Gerbong, LLM detail, Insight process dialog, Prediktif filter/detail/evidence/schedule/SPK dialog, SPK row action popover.

Backend belum tersedia:

- Export PDF/Excel Laporan dan Export SPK tidak diarahkan ke route palsu.
- Tombol menampilkan status `menunggu integrasi backend produksi`.

Dead click yang diperbaiki:

- Acknowledge Alarm yang sebelumnya `alert()`.
- Dropdown filter Alarm yang sebelumnya tidak memfilter data.
- Filter Gerbong Insight yang sebelumnya no-op.
- Filter sheet Prediktif yang sebelumnya sebagian besar statis.
- Generate Report dan tombol export yang sebelumnya tidak memberi feedback jelas.
- Link rute prioritas Overview yang sebelumnya memakai query key yang salah.

## Catatan Manual

- Tidak ada route baru.
- Tidak ada menu sidebar baru.
- Tidak ada perubahan backend.
- Tidak ada perubahan folder `frontend/src/dummy`.
- Tidak ada logic LLM di frontend.
- Query parameter dipakai hanya untuk membawa konteks antar halaman.

## Validasi

Perintah yang dijalankan dari `frontend/`:

| Perintah | Hasil |
| --- | --- |
| `npm run lint` | Lolos |
| `npm run typecheck` | Lolos |
| `npm run test:run` | Lolos, 11 test file dan 46 test passed |
| `npm run build` | Lolos, semua route App Router berhasil dibuat |

Route yang muncul pada build:

```txt
/
/_not-found
/alarm-center
/car-detail
/insight-analytic
/live-monitoring
/overview
/predictive-maintenance
/report-analytics
/settings
/telemetry-explorer
/trainset
/work-order
```
