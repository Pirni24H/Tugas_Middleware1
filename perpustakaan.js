const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.json());

// Koneksi ke Database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'perpustakaan_pbp'
});

db.connect(err => {
  if (err) {
    console.error("Koneksi database gagal:", err);
    return;
  }
  console.log('Database connected!');
});

// GET Semua Buku
app.get('/buku', (req, res) => {
  const { min, max } = req.query;
  let query = "SELECT * FROM Buku_pbp";
  let params = [];

  if (min && max) {
    query += " WHERE tahun BETWEEN ? AND ?";
    params = [min, max];
  }

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: "Gagal mengambil data" });
    res.json(result);
  });
});

// GET Buku berdasarkan ID
app.get('/buku/:id', (req, res) => {
  const id = req.params.id;

  db.query('SELECT * FROM Buku_pbp WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Gagal mengambil data buku" });

    if (result.length === 0) {
      return res.status(404).json({ error: "Buku tidak ditemukan" });
    }

    res.json(result[0]);
  });
});

// POST Tambah Buku
app.post('/buku', (req, res) => {
  const { judul, penulis, tahun } = req.body;

  if (isNaN(tahun)) {
    return res.status(400).json({ error: "Tahun harus berupa angka" });
  }

  db.query(
    'INSERT INTO Buku_pbp (judul, penulis, tahun) VALUES (?, ?, ?)',
    [judul, penulis, tahun],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Gagal menambahkan buku" });

      res.json({
        message: 'Buku berhasil ditambahkan!',
        id: result.insertId
      });
    }
  );
});

app.put('/buku/:id', (req, res) => {
  const id = req.params.id;
  const { judul, penulis, tahun } = req.body;

  if (isNaN(tahun)) {
    return res.status(400).json({ error: "Tahun harus berupa angka" });
  }

  db.query(
    'UPDATE Buku_pbp SET judul = ?, penulis = ?, tahun = ? WHERE id = ?',
    [judul, penulis, tahun, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Gagal memperbarui data buku" });

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Buku tidak ditemukan" });
      }

      res.json({
        message: "Buku berhasil diperbarui!",
        updated_id: id
      });
    }
  );
});

app.delete('/buku/:id', (req, res) => {
  const id = req.params.id;

  db.query(
    'DELETE FROM Buku_pbp WHERE id = ?',
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Gagal menghapus buku" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Buku tidak ditemukan" });
      }

      res.json({ 
        message: "Buku berhasil dihapus!",
        deleted_id: id
      });
    }
  );
});


app.listen(4000, () => console.log('Server berjalan di port 4000'));
