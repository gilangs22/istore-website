-- ================================
-- DATABASE: istore_db
-- ================================

CREATE DATABASE IF NOT EXISTS istore_db;
USE istore_db;

-- ================================
-- TABLE: products
-- ================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category ENUM('iphone', 'casing', 'charger', 'aksesoris') NOT NULL,
    price BIGINT NOT NULL,
    stock INT DEFAULT 0,
    image VARCHAR(500) DEFAULT NULL,
    description TEXT,
    badge ENUM('new', 'hot', 'sale', '') DEFAULT '',
    specs JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ================================
-- INSERT SAMPLE DATA
-- ================================
INSERT INTO products (name, category, price, stock, image, description, badge, specs) VALUES

-- iPhone
('iPhone 15 Pro Max 256GB', 'iphone', 21999000, 15, 
'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=400&hei=400&fmt=png-alpha',
'iPhone 15 Pro Max dengan chip A17 Pro, kamera 48MP, dan titanium design. Performa maksimal untuk gaming dan produktivitas.',
'new',
'{"Layar": "6.7 inch Super Retina XDR", "Chip": "A17 Pro", "Kamera": "48MP + 12MP + 12MP", "Baterai": "4441 mAh", "Storage": "256GB"}'),

('iPhone 15 Pro 128GB', 'iphone', 18999000, 20,
'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-bluetitanium?wid=400&hei=400&fmt=png-alpha',
'iPhone 15 Pro dengan desain titanium premium dan Action Button. Cocok untuk content creator.',
'hot',
'{"Layar": "6.1 inch Super Retina XDR", "Chip": "A17 Pro", "Kamera": "48MP + 12MP + 12MP", "Baterai": "3274 mAh", "Storage": "128GB"}'),

('iPhone 15 128GB', 'iphone', 14999000, 30,
'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-pink?wid=400&hei=400&fmt=png-alpha',
'iPhone 15 dengan Dynamic Island dan USB-C. Pilihan tepat untuk upgrade dari iPhone lama.',
'',
'{"Layar": "6.1 inch Super Retina XDR", "Chip": "A16 Bionic", "Kamera": "48MP + 12MP", "Baterai": "3349 mAh", "Storage": "128GB"}'),

('iPhone 14 128GB', 'iphone', 12499000, 25,
'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-1inch-blue?wid=400&hei=400&fmt=png-alpha',
'iPhone 14 dengan kamera ganda 12MP dan mode Action. Performa handal dengan harga terjangkau.',
'sale',
'{"Layar": "6.1 inch Super Retina XDR", "Chip": "A15 Bionic", "Kamera": "12MP + 12MP", "Baterai": "3279 mAh", "Storage": "128GB"}'),

('iPhone 13 128GB', 'iphone', 10999000, 18,
'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-finish-select-202207-midnight?wid=400&hei=400&fmt=png-alpha',
'iPhone 13 dengan A15 Bionic chip. Pilihan budget-friendly dengan performa solid.',
'sale',
'{"Layar": "6.1 inch Super Retina XDR", "Chip": "A15 Bionic", "Kamera": "12MP + 12MP", "Baterai": "3240 mAh", "Storage": "128GB"}'),

-- Casing
('MagSafe Silicone Case iPhone 15 Pro', 'casing', 799000, 50,
'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MT473?wid=400&hei=400&fmt=png-alpha',
'Case silicone original Apple dengan MagSafe built-in. Proteksi maksimal dengan sentuhan premium.',
'',
'{"Material": "Silicone", "Kompatibilitas": "iPhone 15 Pro", "MagSafe": "Ya", "Warna": "Storm Blue"}'),

('Clear Case iPhone 15', 'casing', 699000, 45,
'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MT203?wid=400&hei=400&fmt=png-alpha',
'Clear case transparan yang memperlihatkan keindahan warna iPhone kamu. Anti-yellowing.',
'hot',
'{"Material": "Polycarbonate + TPU", "Kompatibilitas": "iPhone 15", "MagSafe": "Ya", "Warna": "Clear"}'),

('Leather Case iPhone 15 Pro Max', 'casing', 1999000, 20,
'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MT4U3?wid=400&hei=400&fmt=png-alpha',
'FineWoven case premium dengan tekstur leather yang elegan. MagSafe compatible.',
'new',
'{"Material": "FineWoven", "Kompatibilitas": "iPhone 15 Pro Max", "MagSafe": "Ya", "Warna": "Mulberry"}'),

('Spigen Tough Armor iPhone 15 Pro', 'casing', 450000, 60,
'https://m.media-amazon.com/images/I/71K4IqgLDvL._AC_SL1500_.jpg',
'Case Spigen dengan proteksi military grade. Dual layer protection.',
'',
'{"Material": "TPU + Polycarbonate", "Kompatibilitas": "iPhone 15 Pro", "MagSafe": "Tidak", "Warna": "Black"}'),

-- Charger
('20W USB-C Power Adapter', 'charger', 349000, 100,
'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MHJA3?wid=400&hei=400&fmt=png-alpha',
'Charger 20W original Apple untuk fast charging iPhone. Compact dan travel-friendly.',
'',
'{"Output": "20W", "Port": "USB-C", "Fast Charging": "Ya", "Kompatibilitas": "iPhone 8 ke atas"}'),

('MagSafe Charger', 'charger', 599000, 60,
'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MHXH3?wid=400&hei=400&fmt=png-alpha',
'Wireless charger MagSafe untuk charging tanpa kabel. Snap langsung ke iPhone.',
'new',
'{"Output": "15W", "Koneksi": "MagSafe", "Panjang Kabel": "1m", "Kompatibilitas": "iPhone 12 ke atas"}'),

('35W Dual USB-C Port Adapter', 'charger', 899000, 30,
'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MNWP3?wid=400&hei=400&fmt=png-alpha',
'Charger dual port untuk charging 2 device sekaligus. Total output 35W.',
'hot',
'{"Output": "35W Total", "Port": "2x USB-C", "Fast Charging": "Ya", "Kompatibilitas": "iPhone, iPad, Mac"}'),

('MagSafe Duo Charger', 'charger', 1899000, 15,
'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MHXF3?wid=400&hei=400&fmt=png-alpha',
'Charger untuk iPhone dan Apple Watch sekaligus. Foldable design.',
'',
'{"Output": "14W iPhone + 7.5W Watch", "Koneksi": "MagSafe", "Foldable": "Ya", "Kompatibilitas": "iPhone 12+, Apple Watch"}'),

-- Aksesoris
('AirPods Pro (2nd Gen)', 'aksesoris', 3999000, 35,
'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=400&hei=400&fmt=png-alpha',
'AirPods Pro generasi kedua dengan Active Noise Cancellation dan Adaptive Audio.',
'hot',
'{"ANC": "Ya", "Transparency Mode": "Ya", "Baterai": "6 jam (30 jam dengan case)", "Koneksi": "Bluetooth 5.3"}'),

('AirPods (3rd Gen)', 'aksesoris', 2799000, 40,
'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MME73?wid=400&hei=400&fmt=png-alpha',
'AirPods generasi ketiga dengan Spatial Audio dan desain baru yang lebih nyaman.',
'',
'{"Spatial Audio": "Ya", "Baterai": "6 jam (30 jam dengan case)", "Tahan Air": "IPX4", "Koneksi": "Bluetooth 5.0"}'),

('USB-C to Lightning Cable 1m', 'aksesoris', 299000, 150,
'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MM0A3?wid=400&hei=400&fmt=png-alpha',
'Kabel original Apple USB-C ke Lightning untuk charging dan sync data.',
'',
'{"Panjang": "1 meter", "Input": "USB-C", "Output": "Lightning", "Fast Charging": "Ya"}'),

('USB-C to Lightning Cable 2m', 'aksesoris', 449000, 80,
'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MKQ42?wid=400&hei=400&fmt=png-alpha',
'Kabel original Apple USB-C ke Lightning panjang 2 meter.',
'',
'{"Panjang": "2 meter", "Input": "USB-C", "Output": "Lightning", "Fast Charging": "Ya"}'),

('AirTag (1 Pack)', 'aksesoris', 479000, 70,
'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airtag-single-select-202104?wid=400&hei=400&fmt=png-alpha',
'Tracker untuk melacak barang-barang penting. Presisi tinggi dengan jaringan Find My.',
'new',
'{"Baterai": "CR2032 (1 tahun)", "Koneksi": "Bluetooth + UWB", "Tahan Air": "IP67", "Kompatibilitas": "iPhone, iPad"}'),

('Apple Watch Ultra 2', 'aksesoris', 14999000, 10,
'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-ultra-2-702702702702702702702702702702?wid=400&hei=400&fmt=png-alpha',
'Apple Watch paling tangguh dengan titanium case dan GPS dual-frequency.',
'new',
'{"Layar": "49mm Always-On", "Chip": "S9 SiP", "Baterai": "36 jam", "Tahan Air": "100m"}');

-- ================================
-- TABLE: admin (untuk login nanti)
-- ================================
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin (password: admin123)
-- Password di-hash menggunakan bcrypt
INSERT INTO admin (username, password, name) VALUES 
('admin', '$2b$10$rQZ5Q5Q5Q5Q5Q5Q5Q5Q5QOzV6x6x6x6x6x6x6x6x6x6x6x6x6x6x6', 'Administrator');
