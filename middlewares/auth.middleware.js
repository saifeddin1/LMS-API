const jwt = require('jsonwebtoken');
let userSchema = require("../models/user.model");
require("dotenv").config();
exports.permit = (...permittedRoles) => {
    return (req, res, next) => {
        try {
            console.log("*** MIDDLEWARE verifyToken ***");
            if (!req.headers.authorization) return res.sendStatus(401)
            const token = req.headers.authorization.split(' ')[1];
            if (token == null || !token) return res.sendStatus(401)
            jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
                console.log(err);
                if (err) return res.status(401).json(err);
                console.log("permittedRoles : ", permittedRoles);
                userSchema
                    .findById(user._id).select('currentToken')
                    .then((userDoc) => {
                        // if (!userDoc || userDoc.currentToken != token)
                        //     return res.status(401).json({ message: "Veuillez vous reconnecter." })
                        if (permittedRoles && permittedRoles.length) {
                            if (user && permittedRoles.includes(user.type)) {
                                // console.log("user :", user);
                                req.user = user;
                                next();
                            } else {
                                res.status(403).json({ message: "Forbidden" }); // user is forbidden
                            }
                        } else {
                            // console.log("user :", user);
                            req.user = user;
                            next();
                        }
                    })
                    .catch((err) => res.status(404).json(err));

            })
        } catch {
            res.status(400).json({
                error: new Error('Invalid request!')
            });
        }
    };
}