const jwt = require('jsonwebtoken');
require("dotenv").config();
exports.generateAccessToken = (payload) => {
    console.log("TOKEN_SECRET :", process.env.TOKEN_SECRET);
    console.log("payload :", payload);
    return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '18000000s' });
}