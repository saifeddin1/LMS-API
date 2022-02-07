let userSchema = require("../../models/user.model");
const { connection } = require('../../connection');
const authMehods = require("./auth.methods");
connection.once("open", () => {
    console.log("*** REGISTER ROUTER ***");
});

exports.register = async (req, res) => {
    console.log("req.body :", req.body);
    if (req.body.type === "ESTUDENT" && !req.body.studentNiveauId) res.status(400).json("studentNiveauId is required ")
    const { username, password, email, phone, type, studentNiveauId, studentOffreId, profile, permissions } = req.body;
    console.log("phone :", phone);
    console.log("profile :", profile);
    var availablePhone
    if (profile && profile.phone) {
        availablePhone = profile.phone
    } else {
        availablePhone = phone
    }
    const newUser = new userSchema({
        username,
        password,
        email,
        profile: { ...profile, phone: availablePhone },
        type,
        studentNiveauId,
        studentOffreId,
        permissions
    });
    newUser
        .save()
        .then(async (model) => {
            var user = JSON.parse(JSON.stringify(model))
            delete user.password
            const token = authMehods.generateAccessToken(user);
            await userSchema.findByIdAndUpdate({ _id: user._id },
                { currentToken: token },
                { new: true })
            console.log("token :", token);
            return res.json({ token: token });
        })
        .catch((err) => {
            console.error("err :", err)
            res.status(400).json(err)
        });
}