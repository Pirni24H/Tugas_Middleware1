module.exports = (req, res, next) => {
  const { nama_produk, harga } = req.body;

  if (!nama_produk || !harga) {
    return res.status(400).json({
      message: "Nama dan harga produk wajib diisi"
    });
  }

  next();
};
