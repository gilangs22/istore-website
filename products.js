// ================================
// PRODUCTS API ROUTES
// ================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');

// ================================
// MULTER CONFIG (File Upload)
// ================================

// Create uploads folder if not exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `product-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// ================================
// GET ALL PRODUCTS
// ================================
router.get('/', async (req, res) => {
    try {
        const { category, search, sort, limit, offset } = req.query;
        
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];
        
        // Filter by category
        if (category && category !== 'all') {
            query += ' AND category = ?';
            params.push(category);
        }
        
        // Search by name or description
        if (search) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        // Sorting
        switch (sort) {
            case 'price_asc':
                query += ' ORDER BY price ASC';
                break;
            case 'price_desc':
                query += ' ORDER BY price DESC';
                break;
            case 'newest':
                query += ' ORDER BY created_at DESC';
                break;
            case 'name_asc':
                query += ' ORDER BY name ASC';
                break;
            default:
                query += ' ORDER BY created_at DESC';
        }
        
        // Pagination
        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
            
            if (offset) {
                query += ' OFFSET ?';
                params.push(parseInt(offset));
            }
        }
        
        const [rows] = await pool.execute(query, params);
        
        // Parse specs JSON
        const products = rows.map(product => ({
            ...product,
            specs: product.specs ? JSON.parse(product.specs) : null
        }));
        
        res.json(products);
        
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
});

// ================================
// GET SINGLE PRODUCT
// ================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await pool.execute(
            'SELECT * FROM products WHERE id = ?',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        const product = {
            ...rows[0],
            specs: rows[0].specs ? JSON.parse(rows[0].specs) : null
        };
        
        res.json(product);
        
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: error.message
        });
    }
});

// ================================
// CREATE PRODUCT
// ================================
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { name, category, price, stock, description, badge, specs } = req.body;
        
        // Validate required fields
        if (!name || !category || !price) {
            return res.status(400).json({
                success: false,
                message: 'Name, category, and price are required'
            });
        }
        
        // Handle image URL or uploaded file
        let imageUrl = req.body.image || null;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }
        
        // Parse specs if it's a string
        let specsJson = null;
        if (specs) {
            specsJson = typeof specs === 'string' ? specs : JSON.stringify(specs);
        }
        
        const [result] = await pool.execute(
            `INSERT INTO products (name, category, price, stock, image, description, badge, specs) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, category, price, stock || 0, imageUrl, description || '', badge || '', specsJson]
        );
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: {
                id: result.insertId,
                name,
                category,
                price,
                stock: stock || 0,
                image: imageUrl,
                description,
                badge,
                specs: specs ? JSON.parse(specsJson) : null
            }
        });
        
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
});

// ================================
// UPDATE PRODUCT
// ================================
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, price, stock, description, badge, specs } = req.body;
        
        // Check if product exists
        const [existing] = await pool.execute(
            'SELECT * FROM products WHERE id = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Handle image
        let imageUrl = req.body.image || existing[0].image;
        if (req.file) {
            // Delete old image if it's a local file
            if (existing[0].image && existing[0].image.startsWith('/uploads/')) {
                const oldImagePath = path.join(__dirname, '..', existing[0].image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            imageUrl = `/uploads/${req.file.filename}`;
        }
        
        // Parse specs
        let specsJson = existing[0].specs;
        if (specs) {
            specsJson = typeof specs === 'string' ? specs : JSON.stringify(specs);
        }
        
        await pool.execute(
            `UPDATE products 
             SET name = ?, category = ?, price = ?, stock = ?, image = ?, 
                 description = ?, badge = ?, specs = ?
             WHERE id = ?`,
            [
                name || existing[0].name,
                category || existing[0].category,
                price || existing[0].price,
                stock !== undefined ? stock : existing[0].stock,
                imageUrl,
                description !== undefined ? description : existing[0].description,
                badge !== undefined ? badge : existing[0].badge,
                specsJson,
                id
            ]
        );
        
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: { id: parseInt(id) }
        });
        
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
});

// ================================
// DELETE PRODUCT
// ================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if product exists
        const [existing] = await pool.execute(
            'SELECT * FROM products WHERE id = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Delete image if it's a local file
        if (existing[0].image && existing[0].image.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, '..', existing[0].image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        await pool.execute('DELETE FROM products WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
});

// ================================
// UPDATE STOCK ONLY
// ================================
router.patch('/:id/stock', async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;
        
        if (stock === undefined || stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid stock value is required'
            });
        }
        
        const [result] = await pool.execute(
            'UPDATE products SET stock = ? WHERE id = ?',
            [stock, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Stock updated successfully',
            data: { id: parseInt(id), stock }
        });
        
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update stock',
            error: error.message
        });
    }
});

// ================================
// GET PRODUCTS BY CATEGORY
// ================================
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        
        const [rows] = await pool.execute(
            'SELECT * FROM products WHERE category = ? ORDER BY created_at DESC',
            [category]
        );
        
        const products = rows.map(product => ({
            ...product,
            specs: product.specs ? JSON.parse(product.specs) : null
        }));
        
        res.json(products);
        
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
});

// ================================
// GET PRODUCT STATS
// ================================
router.get('/stats/summary', async (req, res) => {
    try {
        const [totalProducts] = await pool.execute(
            'SELECT COUNT(*) as total FROM products'
        );
        
        const [categoryCount] = await pool.execute(
            'SELECT category, COUNT(*) as count FROM products GROUP BY category'
        );
        
        const [lowStock] = await pool.execute(
            'SELECT COUNT(*) as count FROM products WHERE stock <= 5 AND stock > 0'
        );
        
        const [outOfStock] = await pool.execute(
            'SELECT COUNT(*) as count FROM products WHERE stock = 0'
        );
        
        res.json({
            success: true,
            data: {
                totalProducts: totalProducts[0].total,
                byCategory: categoryCount,
                lowStock: lowStock[0].count,
                outOfStock: outOfStock[0].count
            }
        });
        
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stats',
            error: error.message
        });
    }
});

module.exports = router;