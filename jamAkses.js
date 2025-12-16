module.exports = (req, res, next) => {
    const sekarang = new Date();
    const jam = sekarang.getHours();

    if (jam < 8 || jam >= 18) {
        return res.status(403).json({
            message: "API hanya dapat diakses pada jam 08.00 - 18.00"
        });
    }
    next();
};