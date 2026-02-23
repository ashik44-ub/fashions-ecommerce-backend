const { errorResponse, successResponse } = require("../utilis/responseHandler");
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
    try {
        // ১. Ekhane check korun: prothome cookie, tarpor header
        const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

        // console.log("Extracted Token:", token); // Debug korar jonno eita check korte paren

        if (!token) {
            // Success response na pathiye 401 status pathano-i standard
            return res.status(401).send({
                success: false,
                message: "Unauthorized Access! No token provided."
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (!decoded.userId) {
            return res.status(403).send({ success: false, message: "Access denied! Invalid payload." });
        }

        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    } catch (error) {
        // Token expire hoye gele ba vul hole eikhane ashbe
        return res.status(401).send({ success: false, message: "Invalid or Expired Token!" });
    }
}

module.exports = verifyToken;