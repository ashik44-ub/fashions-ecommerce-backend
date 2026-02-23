const verifyAdmin = (req, res, next) => {
    if (req.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized Access Denied"})
    }
    next();
}

module.exports = verifyAdmin;