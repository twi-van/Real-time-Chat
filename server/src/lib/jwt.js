const jwt = require("jsonwebtoken");

function getSecret(){
    const secret = process.env.JWT_SECRET;
    if(!secret){
        throw new Error("Thiếu JWT_SECRET trong file .env");
    }
    return secret;
}

function signToken(userId) {
    return jwt.sign({ userId }, getSecret(), { expiresIn: "7d" });
}

function verifyToken(token){
    return jwt.verify(token,getSecret());
}

module.exports = { signToken , verifyToken } ;