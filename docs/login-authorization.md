# Login dan Otorisasi Pengguna

## Tujuan

Dokumen ini menjadi rancangan awal login, manajemen sesi, pembagian role, dan izin pengiriman email pada dashboard KAI Predictive Maintenance.

Implementasi login belum tersedia pada frontend saat ini. Identitas operator pada fitur email SPK masih ditulis langsung di kode. Ketika autentikasi sudah diterapkan, identitas tersebut harus berasal dari pengguna yang sedang login.

## Prinsip Utama

- Setiap pengguna masuk menggunakan akun masing-masing.
- Password tidak disimpan atau diperiksa langsung oleh frontend.
- Backend bertanggung jawab memverifikasi kredensial, membuat sesi, dan memeriksa izin.
- Frontend boleh menyembunyikan tombol berdasarkan role, tetapi backend tetap wajib melakukan pemeriksaan izin.
- Pengiriman email dilakukan oleh backend menggunakan satu akun email resmi organisasi.
- Email pengguna yang sedang login digunakan sebagai `reply-to` dan identitas pelaku, bukan sebagai kredensial pengirim.
- Setiap tindakan penting disimpan dalam audit log.

## Role Pengguna

### Operator

Operator menangani kegiatan operasional harian.

Izin yang disarankan:

- Melihat Ringkasan, Armada, Gerbong, Insight, Prediktif, Pantauan, Alarm, SPK, dan Sensor mentah.
- Membuat atau memperbarui SPK sesuai area kerjanya.
- Mengirim email SPK kepada teknisi.
- Membalas atau menindaklanjuti alarm.
- Tidak dapat mengirim broadcast massal.
- Tidak dapat mengelola akun dan role pengguna.

### Supervisor

Supervisor mengawasi kegiatan operator dan komunikasi yang berdampak lebih luas.

Izin yang disarankan:

- Memiliki seluruh izin Operator.
- Memvalidasi Insight atau keputusan operasional.
- Menyetujui dan mengirim broadcast.
- Melihat laporan dan audit aktivitas tim.
- Tidak dapat mengubah konfigurasi sistem sensitif kecuali diberikan izin tambahan.

### Admin

Admin mengelola akses dan konfigurasi aplikasi.

Izin yang disarankan:

- Mengundang, menonaktifkan, dan mengubah role pengguna.
- Mengatur depo, unit kerja, dan cakupan akses pengguna.
- Mengatur daftar penerima email dan broadcast.
- Mengatur integrasi email pada backend.
- Melihat audit log sistem.
- Tidak otomatis bertindak sebagai operator atau supervisor dalam proses persetujuan operasional.

## Matriks Akses Awal

| Fitur | Operator | Supervisor | Admin |
| --- | --- | --- | --- |
| Melihat dashboard operasional | Ya | Ya | Opsional |
| Membuat dan memperbarui SPK | Ya | Ya | Tidak secara default |
| Mengirim email SPK | Ya | Ya | Tidak secara default |
| Membuat draft broadcast | Opsional | Ya | Opsional |
| Mengirim broadcast | Tidak | Ya | Opsional |
| Melihat laporan | Terbatas | Ya | Ya |
| Mengelola pengguna dan role | Tidak | Tidak | Ya |
| Mengatur integrasi email | Tidak | Tidak | Ya |
| Melihat audit log | Aktivitas sendiri | Aktivitas tim | Semua aktivitas |

Matriks ini merupakan baseline. Cakupan akses sebaiknya juga dibatasi berdasarkan depo atau unit kerja, bukan hanya role.

## Alur Login

1. Pengguna membuka halaman `/login`.
2. Pengguna memasukkan email atau ID pegawai dan password.
3. Frontend mengirim kredensial melalui HTTPS ke endpoint login backend.
4. Backend memverifikasi akun, status aktif, dan password hash.
5. Backend membuat sesi dan mengirim cookie sesi yang `HttpOnly`, `Secure`, dan `SameSite`.
6. Frontend mengambil profil pengguna melalui endpoint sesi.
7. Pengguna diarahkan ke halaman yang diizinkan, secara default `/overview`.
8. Setiap request sensitif diperiksa kembali oleh backend berdasarkan sesi, role, dan cakupan depo.

Jika organisasi memiliki Identity Provider, implementasi produksi sebaiknya menggunakan SSO/OIDC milik organisasi daripada menyimpan password lokal.

## Struktur Data Pengguna

Contoh bentuk data yang dapat digunakan oleh backend:

```ts
type User = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: "operator" | "supervisor" | "admin";
  depotIds: string[];
  status: "active" | "inactive";
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};
```

Password hash harus disimpan terpisah dari data profil yang dikirim ke frontend. Jangan pernah mengirim password atau password hash ke browser.

## Kontrak API Awal

Endpoint yang disarankan:

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/forgot-password
POST /api/auth/reset-password

GET   /api/users
POST  /api/users
PATCH /api/users/:id
PATCH /api/users/:id/role
PATCH /api/users/:id/status
```

Contoh respons `GET /api/auth/me`:

```json
{
  "data": {
    "id": "USR-001",
    "employeeId": "KAI-10021",
    "name": "Operator Control Center",
    "email": "operator.depo@kai.id",
    "role": "operator",
    "depotIds": ["DEPO-01"]
  }
}
```

Untuk request tanpa sesi yang valid, backend mengembalikan `401 Unauthorized`. Untuk pengguna yang sudah login tetapi tidak memiliki izin, backend mengembalikan `403 Forbidden`.

## Integrasi dengan Email SPK

Konfigurasi saat ini menggunakan EmailJS langsung dari browser dan identitas operator masih hardcoded. Target implementasi produksinya adalah:

```text
Frontend -> API backend -> Provider email -> Penerima
```

Contoh identitas email:

```text
From: KAI Predictive Maintenance <notification@kai.id>
Reply-To: Operator Control Center <operator.depo@kai.id>
```

Operator tidak perlu menjadi admin pada provider email. Provider hanya dikonfigurasi sekali oleh admin sistem pada backend. Saat operator mengirim email, backend mengambil nama dan email operator dari sesi yang sudah diverifikasi.

Endpoint yang disarankan:

```text
POST /api/work-orders/:id/email
POST /api/broadcasts/draft
POST /api/broadcasts/:id/approve
POST /api/broadcasts/:id/send
```

Aturan minimal:

- Email SPK hanya dapat dikirim oleh Operator atau Supervisor yang memiliki akses ke depo terkait.
- Broadcast hanya dapat dikirim oleh Supervisor atau role khusus yang diberi izin.
- Daftar penerima harus divalidasi oleh backend.
- Kredensial provider email tidak boleh menggunakan variabel `NEXT_PUBLIC_*`.
- Pengiriman massal sebaiknya memakai antrean agar tidak memblokir request dan dapat dicoba ulang jika gagal.
- Sistem harus menyimpan status per penerima: `queued`, `sent`, atau `failed`.

## Audit Log

Aktivitas berikut perlu dicatat:

- Login berhasil dan gagal.
- Logout dan kedaluwarsa sesi.
- Perubahan role atau status pengguna.
- Pembuatan dan perubahan SPK.
- Pengiriman email SPK.
- Pembuatan, persetujuan, dan pengiriman broadcast.
- Perubahan konfigurasi email.

Data audit minimal:

```ts
type AuditLog = {
  id: string;
  actorUserId: string;
  action: string;
  targetType: string;
  targetId: string | null;
  depotId: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
};
```

## Keamanan Minimum

- Wajib menggunakan HTTPS di lingkungan produksi.
- Simpan password menggunakan Argon2id atau bcrypt dengan konfigurasi yang sesuai.
- Gunakan cookie sesi `HttpOnly`; hindari menyimpan token autentikasi permanen di `localStorage`.
- Terapkan rate limit pada login, reset password, email, dan broadcast.
- Tambahkan proteksi CSRF apabila autentikasi menggunakan cookie.
- Batasi masa aktif sesi dan lakukan rotasi sesi setelah login.
- Nonaktifkan seluruh sesi pengguna ketika akunnya dinonaktifkan.
- Jangan menaruh secret SMTP atau API key provider di frontend.
- Pertimbangkan MFA, terutama untuk Supervisor dan Admin.

## Tahapan Implementasi

1. Tambahkan model pengguna, role, cakupan depo, dan audit log di backend.
2. Implementasikan endpoint login, logout, dan profil sesi.
3. Buat halaman `/login` dan penyedia sesi pada frontend.
4. Tambahkan route guard dan kontrol tampilan berdasarkan role.
5. Ganti identitas operator hardcoded dengan data dari sesi.
6. Pindahkan pengiriman email dari EmailJS browser ke endpoint backend.
7. Tambahkan alur draft, persetujuan, dan pengiriman broadcast.
8. Tambahkan pengujian izin untuk setiap endpoint sensitif.

## Kriteria Selesai

- Pengguna dapat login dan logout dengan sesi yang aman.
- Route yang dilindungi tidak dapat dibuka tanpa login.
- Operator, Supervisor, dan Admin hanya melihat tindakan yang sesuai dengan izinnya.
- Backend menolak tindakan yang tidak diizinkan meskipun request dibuat di luar UI.
- Email SPK menggunakan pengirim resmi dan `reply-to` pengguna yang sedang login.
- Operator tidak memerlukan akses admin ke provider email.
- Broadcast memerlukan role atau persetujuan yang sesuai.
- Semua tindakan penting tercatat dalam audit log.
