const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'toko_online'
});

db.connect(err => {
  if (err) {
    console.error("Koneksi database gagal:", err);
    return;
  }
  console.log('Database connected!');
});

// GET /produk + filter harga
app.get('/produk', (req, res) => {
  const { min, max } = req.query;

  let query = "SELECT * FROM produk";
  let params = [];

  if (min && max) {
    query += " WHERE Harga BETWEEN ? AND ?";
    params = [min, max];
  }

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: "Gagal mengambil data" });
    res.json(result);
  });
});

// GET /produk/:id
app.get('/produk/:id', (req, res) => {
  const id = req.params.id;

  db.query(
    'SELECT * FROM produk WHERE id_Produk = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Gagal mengambil produk" });
      
      if (result.length === 0) {
        return res.status(404).json({ error: "Produk tidak ditemukan" });
      }

      res.json(result[0]);
    }
  );
});

// POST /produk
app.post('/produk', (req, res) => {
  const { nama_Produk, jml_stock, Harga } = req.body;

  if (isNaN(Harga)) {
    return res.status(400).json({ error: "Harga harus angka" });
  }

  db.query(
    'INSERT INTO produk (nama_Produk, jml_stock, Harga) VALUES (?, ?, ?)',
    [nama_Produk, jml_stock, Harga],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Gagal menambahkan produk" });
      }

      res.json({
        message: 'Produk ditambahkan!',
        id_Produk: result.insertId
      });
    }
  );
});

// PUT /produk/:id
app.put('/produk/:id', (req, res) => {
  const id = req.params.id;
  const { nama_Produk, jml_stock, Harga } = req.body;

  if (isNaN(Harga)) {
    return res.status(400).json({ error: "Harga harus angka" });
  }

  db.query(
    'UPDATE produk SET nama_Produk = ?, jml_stock = ?, Harga = ? WHERE id_Produk = ?',
    [nama_Produk, jml_stock, Harga, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Gagal memperbarui produk" });

      res.json({ 
        message: 'Produk berhasil diperbarui!',
        updated_id: id
      });
    }
  );
});

// DELETE /produk/:id
app.delete('/produk/:id', (req, res) => {
  const id = req.params.id;

  db.query(
    'DELETE FROM produk WHERE id_Produk = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Gagal menghapus produk" });

      res.json({
        message: 'Produk berhasil dihapus!',
        deleted_id: id
      });
    }
  );
});

app.listen(3000, () => console.log('Server berjalan di port 3000'));
