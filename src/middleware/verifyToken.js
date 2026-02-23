const { errorResponse, successResponse } = require("../utilis/responseHandler");

const jwt = require('jsonwebtoken')
const jwt_secret = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
    try {
        // ei token ta live server a use korar jonno
        const token = req.cookies.token;  // todo uncomment this when done
        //ei token sudu postman a kaj korar jonno
        //const token = req.headers.authorization?.split(' ')[1]
        //console.log("Token form cookies", token)
        if (!token) {
            return successResponse(res, 401, "Token not found");
        }
        const decoded = jwt.verify(token, jwt_secret)
        if(!decoded.userId){
            return res.status(403).send({message: "User id not found in token"})
        }
        req.userId = decoded.token;
        req.role = decoded.role;
        next();
    } catch (error) {
        errorResponse(res, 500, "Invalid Token!", error)
    }
}

module.exports = verifyToken;