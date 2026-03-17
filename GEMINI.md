# iStore Project Context

## Project Overview
Website e-commerce "iStore" untuk penjualan produk Apple dan aksesorisnya. Memiliki fitur katalog produk bagi pengguna dan dashboard manajemen bagi admin.

## Tech Stack
- **Backend:** Node.js (Express)
- **Database:** PostgreSQL (Supabase via `pg` pool)
- **Storage:** Supabase Storage (untuk gambar produk)
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Libraries:** Multer (upload), CORS, Supabase-JS

## Project Structure
- `index.js`: Entry point server, konfigurasi database, storage, dan API routes.
- `routes/admin.js`: Route khusus untuk fungsionalitas admin.
- `admin/`: Berisi file statis untuk panel admin (`index.html`, `admin.js`, `styles.css`).
- `public/`: Berisi file statis untuk website utama (katalog pembeli).
- `uploads/`: Folder lokal sementara untuk upload (meskipun sekarang sudah migrasi ke Supabase).

## Current Status
- [x] Koneksi database Supabase berhasil dikonfigurasi.
- [x] Tabel `products` otomatis dibuat jika belum ada.
- [x] Fitur upload gambar langsung ke Supabase Storage.
- [x] CRUD Produk lengkap (Create, Read, Update, Delete) di sisi Admin.
- [x] Dashboard Admin dengan statistik (Total produk, stok rendah, habis).
- [x] Filter kategori, pencarian, dan pengurutan harga/nama.

## Recent Work
- Migrasi penyimpanan gambar dari lokal ke Supabase Storage.
- Integrasi penghapusan gambar di Supabase saat produk dihapus dari database.
- Perbaikan parsing JSON pada bagian spesifikasi produk di admin panel.

## Next Steps / Ideas
- [ ] Implementasi sistem login/auth untuk Admin.
- [ ] Fitur keranjang belanja (Cart) di sisi publik.
- [ ] Halaman detail produk yang lebih lengkap.
- [ ] Integrasi payment gateway (simulasi).

---
*File ini diperbarui otomatis oleh Gemini CLI untuk menjaga kontinuitas pengerjaan.*
