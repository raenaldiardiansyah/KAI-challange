# Frontend Update Notes

Tanggal: 2026-07-06

## Ringkasan

Update ini merapikan beberapa alur operasional frontend agar lebih eksplisit, konsisten secara visual, dan lebih aman untuk dipush karena sudah ditutup dengan test behavior.

## Perubahan UI/UX

- Summary card utama di frontend memakai pola yang konsisten: background putih dengan border warna sebagai penanda status/kategori.
- Sidebar dibuat lebih stabil saat browser zoom in/out. Area menu sidebar bisa scroll tanpa menabrak jam, dan scrollbar disembunyikan saat idle.
- Daftar alarm dirapikan:
  - Aksi dibuat proporsional antara `Evidence` dan `Buat SPK`.
  - Acknowledge memakai ikon centang biru terpisah di kanan.
  - Evidence diberi border sesuai warna aksi utama.
- Pop-up aksi SPK di `/work-order` menggantikan dropdown inline titik tiga.
  - Override prioritas diberi warna per level.
  - Hover tombol prioritas menampilkan warna solid dengan teks putih.
  - `Lihat Evidence` dan `Buat Catatan` punya warna yang berbeda.
- Filter subsistem di `/car-detail` sudah aktif dan memfilter kartu `Status Subsistem`.

## Routing Eksplisit

- Klik cell pada `Peta Risiko Subsistem` di `/trainset` sekarang menuju detail yang eksplisit:
  - `trainset`
  - `car`
  - `subsystem`
- Contoh:
  - `/car-detail?trainset=TS-001&car=5&subsystem=Brake+System`
  - `/car-detail?trainset=TS-002&car=3&subsystem=HVAC`

## TDD dan Quality Gate

Test baru ditambahkan untuk mengunci behavior penting:

- `CarSelectorFilter.test.tsx`
  - Memastikan filter subsistem mempertahankan `trainset` dan `car`.
  - Memastikan pilihan `Semua Subsistem` menghapus query `subsystem`.
- `SubsystemHeatmap.test.tsx`
  - Memastikan klik cell heatmap menuju route eksplisit.
  - Memastikan navigasi keyboard ke cell heatmap juga bekerja.

Validasi terakhir:

- `pnpm run lint` passed
- `pnpm run typecheck` passed
- `pnpm run test:run` passed, 44 tests
- `git diff --check` passed
