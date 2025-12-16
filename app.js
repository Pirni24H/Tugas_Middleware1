const express = require("express");
const mysql = require("mysql2");
const app = express();
const logging = require('./middleware/logging'); 
const validasiproduk = require("./middleware/validasiproduk");
const auth = require('./middleware/auth');
const executionTime = require("./middleware/executionTime");
const jamAkses = require("./middleware/jamAkses");

app.use(logging);
app.use(executionTime);
app.use(jamAkses);
app.use(express.urlencoded({extended: false}));
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "toko_online"
});

db.connect((err) => {
  if (err) throw err;
  console.log("Database Connected");
});

// GET semua produk / filter harga
app.get("/produk", (req, res) => {
  const { min, max } = req.query;

  if (min && max) {
    db.query(
      "SELECT * FROM produk WHERE harga BETWEEN ? AND ?",
      [min, max],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
      }
    );
  } else {
    db.query("SELECT * FROM produk", (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    });
  }
});

// GET produk by id
app.get("/produk/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    "SELECT * FROM produk WHERE id_produk=?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length === 0) {
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      }
      res.json(result[0]);
    }
  );
});

// POST produk
app.post("/produk", validasiproduk,(req, res) => {
  const { nama_produk, jml_stock, harga } = req.body;

  if (!nama_produk || !jml_stock || !harga) {
    return res.status(400).json({ message: "Semua field harus diisi" });
  }

  if (isNaN(harga)) {
    return res.status(400).json({ message: "Harga harus berupa angka" });
  }

  db.query(
    "INSERT INTO produk (nama_produk, jml_stock, harga) VALUES (?, ?, ?)",
    [nama_produk, jml_stock, harga],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        message: "Produk berhasil ditambahkan",
        id_produk: result.insertId
      });
    }
  );
});

// PUT produk
app.put("/produk/:id", (req, res) => {
  const id = req.params.id;
  const { nama_produk, jml_stock, harga } = req.body;

  if (harga && isNaN(harga)) {
    return res.status(400).json({ message: "Harga harus berupa angka" });
  }

  db.query(
    "UPDATE produk SET nama_produk=?, jml_stock=?, harga=? WHERE id_produk=?",
    [nama_produk, jml_stock, harga, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      }
      res.json({ message: "Produk berhasil diperbarui" });
    }
  );
});

app.delete("/produk/:id", auth, (req, res) => {
  const id = req.params.id;

  db.query(
    "DELETE FROM produk WHERE id_produk=?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      }

      res.json({
        message: "Produk berhasil dihapus",
        id_produk: id
      });
    }
  );
});

app.listen(3000, () => {
  console.log("Server berjalan di http://localhost:3000");
});
