let userSchema = require("../../models/user.model");
const { connection } = require('../../connection');
const authMehods = require("./auth.methods");

connection.once("open", () => {
    console.log("*** LOGIN ROUTER ***");
});

exports.login = async (req, res) => {
    const { password } = req.body;
    userSchema
        .findOne({
            email: { "$regex": req.params.email, "$options": "i" },
        })
        .then((user) => {
            user.comparePassword(password, function (err, isMatch) {
                if (err) return res.status(400).json(err);
                if (isMatch) {
                    user = JSON.parse(JSON.stringify(user))
                    // delete user.password
                    const { password, currentToken, ...newUserObj } = user;
                    const token = authMehods.generateAccessToken(newUserObj);
                    userSchema.findByIdAndUpdate({ _id: user._id },
                        { currentToken: token },
                        { new: true })
                        .then((savedDoc) => console.log(savedDoc))
                        .catch((err) => console.error(err));

                    return res.json({ token: token });
                } else {
                    return res.json(isMatch);
                }
            });
        })
        .catch((err) => res.status(400).json(`Error: User Not Found`));
}

exports.logout = async (req, res) => {
    const { user } = req
    userSchema.findByIdAndUpdate({ email: user.email },
        { currentToken: '' },
        { new: true })
        .then((savedDoc) => res.status(204).json())
        .catch((err) => res.status(500).json(err));
}