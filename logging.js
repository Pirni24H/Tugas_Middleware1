module.exports = (req, res, next) => {
    console.log(`[LOG]${req.method}${req.url} - ${new Date ().toLocaleString()}`);
    next();
};