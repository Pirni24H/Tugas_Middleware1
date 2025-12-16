module.exports = (req, res, next) => {
    const token = req.headers.token;

    if (token !== "Admin123"){
        return res.status(403).json({
            massage:"Akses Ditolak. Token Tidak Valid!"
        });
    }
    next();
;}