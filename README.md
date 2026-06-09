# Sistem Manajemen & Peminjaman APD (HSSE)

![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Inertia.js](https://img.shields.io/badge/Inertia.js-9553E9?style=for-the-badge&logo=inertia&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)

Sebuah platform aplikasi berbasis web yang dikembangkan untuk mendigitalisasi proses peminjaman dan pengelolaan inventaris Alat Pelindung Diri (APD) di lingkungan **PT Pertamina Geothermal Energy Tbk**. Sistem ini dirancang agar tim HSSE dan pekerja di lapangan dapat berkoordinasi dengan lebih cepat, terstruktur, dan transparan.

---

## Fitur Utama

- **Manajemen Inventaris Terpadu** — Pantau ketersediaan barang berdasarkan varian ukuran dan status fisiknya (Tersedia, *Laundry*, atau Perbaikan).
- **Alur Peminjaman Interaktif** — Pekerja dapat mengajukan peminjaman secara mandiri, sementara Admin memiliki kontrol penuh untuk menyetujui, menolak, atau mengonfirmasi pengembalian alat.
- **Deteksi Keterlambatan Otomatis** — Sistem secara pintar akan melabeli transaksi menjadi "Terlambat" apabila melewati tenggat waktu yang telah disepakati.
- **Dashboard Analitik & Statistik** — Visualisasi data menggunakan *Recharts* dan *Chart.js* untuk melihat tren peminjaman mingguan, bulanan, hingga rasio ketersediaan alat di gudang.
- **Keamanan Akun (Simulasi OTP)** — Perubahan data sensitif seperti Email dan Nomor WhatsApp harus melewati verifikasi *One-Time Password*.
- **Ekspor Laporan (Excel)** — Unduh rekapitulasi data peminjaman dan metrik statistik langsung ke dalam format `.xlsx`.
- **Audit Log Terpusat** — Setiap barang masuk atau perubahan stok akan dicatat otomatis oleh sistem beserta nama admin yang bertugas.

---

## Matriks Hak Akses

Sistem ini membagi wewenang ke dalam dua peran utama:

| Fungsionalitas | Pekerja (User) | Admin HSSE |
|---|---|---|
| Membuat pengajuan pinjaman | ✅ | ✅ |
| Memantau status pengajuan pribadi | ✅ | ✅ |
| Konfirmasi & eksekusi peminjaman | ❌ | ✅ |
| Tambah / Edit / Hapus data barang | ❌ | ✅ |
| Akses Dashboard analitik | ❌ | ✅ |
| Ekspor laporan Excel | ❌ | ✅ |
| Manajemen status akun karyawan | ❌ | ✅ |

---

## Prasyarat Sistem

- PHP 8.2+
- Composer
- Node.js 18+ & NPM
- MySQL atau MariaDB

---

## Panduan Instalasi (Linux / Production Server)

**1. Server Preparation**
Pastikan peladen Anda sudah terinstal web server, PHP (minimal versi 8.2 beserta ekstensi yang dibutuhkan), MySQL/MariaDB, dan Node.js.
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install php8.2 php8.2-fpm php8.2-mysql php8.2-xml php8.2-curl php8.2-mbstring php8.2-zip unzip curl
sudo apt install nodejs npm
```

**2. Cloning the Repository**
```bash
cd /var/www/
git clone [https://github.com/zxi-tech/nama-repo-kamu.git](https://github.com/zxi-tech/nama-repo-kamu.git) hsse-app
cd hsse-app
```

**3. Dependencies & Environment Configuration**
```bash
# Instalasi Backend (PHP)
composer install --optimize-autoloader --no-dev

# Persiapan file environment
cp .env.example .env
php artisan key:generate

# Instalasi Frontend (React/Inertia) dan kompilasi aset
npm install
npm run build
```

**4. Database and Storage Setup**
```bash
# Menjalankan migrasi dan seeding dengan aman (bypass production prompt)
php artisan migrate --force
php artisan db:seed --force

# Menghubungkan folder public dengan direktori storage untuk akses gambar
php artisan storage:link
```

**5. Directory Permissions**
```bash
# Mengubah kepemilikan folder ke grup web server (www-data untuk Nginx/Apache di Ubuntu)
sudo chown -R www-data:www-data /var/www/hsse-app

# Menyesuaikan izin file dan direktori secara umum
sudo find /var/www/hsse-app -type f -exec chmod 644 {} \;
sudo find /var/www/hsse-app -type d -exec chmod 755 {} \;

# Memberikan akses tulis penuh untuk folder storage dan cache
sudo chmod -R 775 storage bootstrap/cache
```

**6. Cache Optimization**
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```
