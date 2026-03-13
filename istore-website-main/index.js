const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");
const multer = require("multer");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool
  .query("SELECT NOW()")
  .then(() => console.log("✅ Database connected!"))
  .catch((err) => console.error("❌ DB Error:", err.message));

// Multer Configuration (Memory Storage for Supabase)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new Error("Hanya file gambar (jpg, png, gif, webp) yang diperbolehkan!"),
    );
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files (Public)
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ============================================
// ADMIN ROUTES (Server-side)
// ============================================
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

// Admin Static Files (CSS, JS, Images)
// This comes AFTER routes so dynamic routes take priority
app.use("/admin", express.static(path.join(__dirname, "admin")));
// ============ API ROUTES ============

// Upload Image to Supabase Storage
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Tidak ada file yang diupload" });
    }

    const file = req.file;
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    const filePath = `product-images/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("products")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    // Get Public URL
    const { data: urlData } = supabase.storage
      .from("products")
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;
    console.log("📸 Gambar diupload ke Supabase:", imageUrl);

    res.json({
      success: true,
      imageUrl: imageUrl,
      filename: fileName,
      path: filePath
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET All Products
app.get("/api/products", async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = "SELECT * FROM products WHERE 1=1";
    const params = [];
    let paramCount = 0;

    if (category && category !== "all") {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    switch (sort) {
      case "price_asc":
        query += " ORDER BY price ASC";
        break;
      case "price_desc":
        query += " ORDER BY price DESC";
        break;
      case "name_asc":
        query += " ORDER BY name ASC";
        break;
      default:
        query += " ORDER BY created_at DESC";
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET Single Product
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE Product
app.post("/api/products", async (req, res) => {
  try {
    const { name, category, price, stock, image, description, badge, specs } =
      req.body;
    if (!name || !category || !price) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, category, and price are required",
        });
    }
    const result = await pool.query(
      `INSERT INTO products (name, category, price, stock, image, description, badge, specs) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        name,
        category,
        price,
        stock || 0,
        image || "",
        description || "",
        badge || "",
        specs || null,
      ],
    );
    console.log("✅ Produk ditambahkan:", result.rows[0].name);
    res
      .status(201)
      .json({
        success: true,
        message: "Product created",
        data: result.rows[0],
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE Product
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, image, description, badge, specs } =
      req.body;
    const result = await pool.query(
      `UPDATE products SET 
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        price = COALESCE($3, price),
        stock = COALESCE($4, stock),
        image = COALESCE($5, image),
        description = COALESCE($6, description),
        badge = COALESCE($7, badge),
        specs = COALESCE($8, specs),
        updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [name, category, price, stock, image, description, badge, specs, id],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    console.log("✅ Produk diupdate:", result.rows[0].name);
    res.json({
      success: true,
      message: "Product updated",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE Product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Delete image from Supabase if exists
    if (result.rows[0].image && result.rows[0].image.includes("supabase.co")) {
      try {
        // Extract path from URL (e.g., .../products/object/public/products/product-images/123.jpg)
        // Usually: products/product-images/filename.ext
        const urlParts = result.rows[0].image.split("/public/products/");
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          const { error: deleteError } = await supabase.storage
            .from("products")
            .remove([filePath]);
          
          if (deleteError) {
            console.error("⚠️ Gagal hapus gambar di Supabase:", deleteError.message);
          } else {
            console.log("🗑️ Gambar dihapus dari Supabase:", filePath);
          }
        }
      } catch (err) {
        console.error("⚠️ Error saat menghapus gambar:", err.message);
      }
    }

    console.log("🗑️ Produk dihapus:", result.rows[0].name);
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stats
app.get("/api/stats/summary", async (req, res) => {
  try {
    const total = await pool.query("SELECT COUNT(*) FROM products");
    const byCategory = await pool.query(
      "SELECT category, COUNT(*) FROM products GROUP BY category",
    );
    const lowStock = await pool.query(
      "SELECT COUNT(*) FROM products WHERE stock <= 5 AND stock > 0",
    );
    const outOfStock = await pool.query(
      "SELECT COUNT(*) FROM products WHERE stock = 0",
    );
    res.json({
      success: true,
      data: {
        totalProducts: parseInt(total.rows[0].count),
        byCategory: byCategory.rows,
        lowStock: parseInt(lowStock.rows[0].count),
        outOfStock: parseInt(outOfStock.rows[0].count),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running!",
    timestamp: new Date().toISOString(),
  });
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log("========================================");
  console.log("🚀 iStore Server Running!");
  console.log(`📍 Port: ${PORT}`);
  console.log("🛒 Website: /");
  console.log("👤 Admin: /admin");
  console.log("📦 API: /api/products");
  console.log("📸 Upload: /api/upload");
  console.log("========================================");
});
