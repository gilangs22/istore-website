const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price INTEGER NOT NULL,
  stock INTEGER DEFAULT 0,
  image VARCHAR(255),
  description TEXT,
  badge VARCHAR(50),
  specs JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);`;

pool
  .query(createTableQuery)
  .then(() => {
    console.log('✅ Tabel "products" berhasil dibuat!');
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
