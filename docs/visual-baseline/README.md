# Visual Baseline Frontend KAI

Baseline ini diambil sebelum integrasi API RAMS pada viewport desktop `1440 x 900`.

## Cakupan

- 11 route frontend.
- Skala `50% Compact`, `75% Balanced`, dan `100% Normal`.
- Sidebar dalam kondisi collapsed.
- Data menggunakan Dummy Mode yang sudah menjadi baseline proyek.

Screenshot tersimpan di:

```text
docs/visual-baseline/before/50
docs/visual-baseline/before/75
docs/visual-baseline/before/100
```

Validasi setelah fase autentikasi tersimpan di:

```text
docs/visual-baseline/after-auth/login.png
docs/visual-baseline/after-auth/50
docs/visual-baseline/after-auth/75
docs/visual-baseline/after-auth/100
```

Halaman login berdiri sendiri tanpa sidebar/dashboard shell dan tepat setinggi
viewport. Seluruh 11 route setelah fase autentikasi tetap `Fit` pada skala 50%.

Masing-masing folder berisi:

```text
overview.png
trainset.png
car-detail.png
insight-analytic.png
predictive-maintenance.png
live-monitoring.png
alarm-center.png
work-order.png
report-analytics.png
settings.png
telemetry-explorer.png
```

## Baseline overflow

Pengukuran dilakukan pada `.content-scroll-area` setelah hidrasi skala selesai.

| Route | 50% | 75% | 100% |
| --- | --- | --- | --- |
| `/overview` | Fit | Scroll | Scroll |
| `/trainset` | Fit | Fit | Scroll |
| `/car-detail` | Fit | Scroll ringan | Scroll |
| `/insight-analytic` | Fit | Scroll ringan | Scroll |
| `/predictive-maintenance` | Fit | Scroll | Scroll |
| `/live-monitoring` | Fit | Fit | Fit |
| `/alarm-center` | Fit | Scroll ringan | Scroll |
| `/work-order` | Fit | Fit | Fit |
| `/report-analytics` | Fit | Scroll | Scroll |
| `/settings` | Fit | Fit | Fit |
| `/telemetry-explorer` | Fit | Fit | Scroll ringan |

`Fit` berarti tinggi konten tidak melebihi tinggi area konten. Scroll pada skala 75% dan 100% diperbolehkan oleh spesifikasi.

## Guardrail integrasi

- Skala 50% harus tetap fit pada viewport baseline.
- Grid utama, urutan card, proporsi kolom, dan padding halaman tidak diubah.
- Teks API panjang harus memakai clamp, tooltip, popover, modal, atau drawer.
- Overlay tidak boleh menambah tinggi layout.
- Perubahan CSS untuk integrasi harus memakai selector lokal komponen.
- Setelah setiap fase halaman, ambil screenshot pembanding pada tiga skala.

## Catatan reproduksi

- URL lokal: `http://localhost:3000`.
- Viewport: `1440 x 900`.
- Browser: Chromium in-app browser.
- Baseline dibuat pada branch `main` dengan working tree bersih.
