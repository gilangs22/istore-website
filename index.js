require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/admin", express.static(path.join(__dirname, "admin")));

// Helper: Ambil path file dari URL Supabase
const getFilePathFromUrl = (url) => {
    if (!url || !url.includes("storage/v1/object/public/products/")) return null;
    return url.split("storage/v1/object/public/products/")[1];
};

// Helper: Bersihkan data
const cleanData = (data) => {
    const cleaned = { ...data };
    delete cleaned.id;
    delete cleaned.created_at;
    return cleaned;
};

// ============ API ROUTES ============

app.get("/api/products", async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").select("*").eq("id", req.params.id).single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: "Produk tidak ditemukan" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const cleanedBody = cleanData(req.body);
    const { data, error } = await supabase.from("products").insert([cleanedBody]).select();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    // 1. Ambil data lama untuk cek foto lama
    const { data: oldProduct } = await supabase.from("products").select("image").eq("id", req.params.id).single();
    
    const cleanedBody = cleanData(req.body);
    
    // 2. Update database
    const { data, error } = await supabase.from("products").update(cleanedBody).eq("id", req.params.id).select();

    if (error) return res.status(400).json({ error: error.message });

    // 3. Jika update sukses DAN ada foto baru, hapus foto lama dari storage
    if (oldProduct && oldProduct.image && oldProduct.image !== cleanedBody.image) {
        const oldPath = getFilePathFromUrl(oldProduct.image);
        if (oldPath) {
            await supabase.storage.from("products").remove([oldPath]);
            console.log("🗑️ Foto lama dihapus:", oldPath);
        }
    }

    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    // 1. Ambil data untuk tahu path fotonya
    const { data: product } = await supabase.from("products").select("image").eq("id", req.params.id).single();
    
    // 2. Hapus dari database
    const { error } = await supabase.from("products").delete().eq("id", req.params.id);
    if (error) throw error;

    // 3. Hapus fotonya dari storage
    if (product && product.image) {
        const filePath = getFilePathFromUrl(product.image);
        if (filePath) {
            await supabase.storage.from("products").remove([filePath]);
            console.log("🗑️ Foto produk dihapus dari storage:", filePath);
        }
    }

    res.json({ success: true, message: "Terhapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// STATS SUMMARY
app.get("/api/stats/summary", async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").select("id");
    if (error) throw error;
    res.json({ success: true, data: { totalProducts: data.length } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPLOAD IMAGE
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });
    const file = req.file;
    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    const filePath = `product-images/${fileName}`;

    const { error } = await supabase.storage.from("products").upload(filePath, file.buffer, { contentType: file.mimetype });
    if (error) throw error;

    const { data: urlData } = supabase.storage.from("products").getPublicUrl(filePath);
    res.json({ success: true, imageUrl: urlData.publicUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on Port ${PORT} with Auto-Cleanup Storage`);
});
