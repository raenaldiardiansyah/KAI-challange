# UI Flow

Operator masuk ke `/overview` untuk melihat prioritas tertinggi lebih dulu: alarm aktif, trainset dengan health score rendah, priority insight, dan rekomendasi tindakan.

Teknisi membuka `/car-detail` untuk investigasi detail gerbong, termasuk evidence sensor, telemetry BP/BC, raw telemetry, threshold comparison, dan rekomendasi tindakan. `/insight-analytic` tetap dipakai untuk melihat structured insight dan alur analitik.

Catatan: fitur Telemetry Explorer tidak lagi ditampilkan sebagai menu sidebar terpisah. Route `/telemetry-explorer` masih dipertahankan sebagai hidden route, sementara alur utama telemetry dipindahkan ke tab internal di `/car-detail`.
