let userSchema = require("../models/user.model");

const { connection } = require('../connection');
const { INSTRUCTOR } = require("../constants/roles.constant");
connection.once("open", () => {
    // init stream
    console.log("*** USER ROUTER ***");
});

/**
 * Get All Students
 * @return student[]
 */
exports.getAllStudents = async (req, res) => {
    userSchema
        .find({ type: "ESTUDENT" }).populate('studentNiveauId').populate('studentOffreId')
        .then((response) => res.json(response))
        .catch((err) => res.status(400).json(`Error: ${err}`));
};

/**
 * Get All Instructors
 * @return Instructor[]
 */
exports.getAllInstructors = async (req, res) => {
    userSchema.find({ type: INSTRUCTOR }).select('-password')
        .then((response) => res.json(response))
        .catch((err) => res.status(400).json(`Error: ${err}`));
};

/**
 * Get All Instructors Names
 * @return Instructor[]
 */
exports.getAllInstructorsNames = async (req, res) => {
    userSchema.aggregate([
        { '$match': { 'type': INSTRUCTOR } },
        { '$project': { 'name': "$profile.fullName" } }
    ]).then((response) => res.json(response))
        .catch((err) => res.status(400).json(`Error: ${err}`));
};

/**
 * GET user by id (username)
 * @param id user id
 * @return user
 */
exports.getUser = async (req, res) => {
    const { user } = req
    console.log("user : ", user);
    console.log("getUser Method");
    userSchema.findOne({ '_id': user._id }).select("-password")
        .then((doc) => {
            if (doc === null) return res.status(404).json("no user found");
            return res.json(doc);
        })
        .catch((err) => res.status(404).json("no user found" + err));
};

/**
 * GET user by id 
 * @param id user id
 * @return user
 */
exports.getUserById = async (req, res) => {
    console.log("getUserById Method");
    userSchema.findOne({ '_id': req.params.id }).select("-password")
        .then((doc) => {
            if (!doc || doc === null) return res.status(404).json("no user found");
            return res.json(doc);
        })
        .catch((err) => res.status(404).json("no user found" + err));
};

/**
 * GET users by search query
 * @param query the search query
 * @return array of users that satisfy the query
 */
exports.search = async (req, res) => {
    const { query } = req.params;
    userSchema
        .find({
            $or: [
                { username: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
                { type: { $regex: query, $options: "i" } },
            ],
        }).select("-password")
        .then((users) => {
            res.json(users);
        })
        .catch((err) => res.status(404).json("None Found"));
};

/**
 * PUT Update User
 * @param _id user id
 * @param req req.body
 * @return user
 */
exports.editUser = async (req, res) => {
    const { user } = req
    console.log("user : ", user);
    userSchema
        .findByIdAndUpdate(user._id, req.body, { new: true })
        .populate({ path: 'studentNiveauId' })
        .populate({ path: 'studentOffreId' })
        .then((doc) => {
            return res.json(doc)
        })
        .catch((err) => res.status(400).json(err));
};

/**
 * PUT Update User
 * @param _id user id
 * @param req req.body
 * @return user
 */
exports.editById = async (req, res) => {
    var { body } = req;
    if (body)
        if (body.studentOffreId == "") {
            delete body.studentOffreId
        } if (body.studentNiveauId == "") {
            delete body.studentNiveauId
        }
    userSchema
        .findByIdAndUpdate(req.params.id, body, { new: true })
        .populate({ path: 'studentNiveauId' })
        .populate({ path: 'studentOffreId' })
        .then((doc) => {
            return res.json(doc)
        })
        .catch((err) => res.status(400).json(err));
};

/**
 * PUT update password
 * @param req { _id, password }
 * @param _id user id
 * @param password new password
 * @return user
 */
exports.updatePassword = async (req, res) => {
    const { user } = req
    console.log("user : ", user);
    const { password } = req.body;
    userSchema
        .findById(user._id)
        .then((user) => {
            user.password = password;
            user.save()
                .then(() => res.json(user))
                .catch((err) => res.json(err));
        })
        .catch((err) => res.status(400).json(err));
};

/**
 * PUT update credit (user)
 * @param req {credit}
 * @return user
 */
exports.updateCredit = async (req, res) => {
    const { user } = req
    console.log("user : ", user);
    const { credit } = req.body;
    userSchema
        .findById(user._id).select("-password")
        .then((user) => {
            user.credit = user.credit + Number(credit);
            user
                .save()
                .then(() => res.json(user))
                .catch((err) => res.json(err));
        })
        .catch((err) => res.status(400).json(err));
};

/**
 * PUT user profile
 * @param _id id of the user
 * @param profile {fullName, phone, linkedIn, facebook}
 * @return user
 */
exports.editProfile = async (req, res) => {
    const { profile } = req.body;
    const { user } = req;
    console.log("user : ", user);
    userSchema.findById(user._id).then(user => {
        user.profile = profile;
        user.save().then(model => res.json(model)).catch(err => res.status(400).json(err));
    }).catch(err => res.status(404).json(err));
};

/**
 * PUT add new chat id to user
 * @param userId id of user
 * @param chatId id of chat
 * @return user
 */
exports.addChat = async (req, res) => {
    const { userId, chatId } = req.body;
    userSchema
        .findById(userId)
        .then((user) => {
            user.chats = user.chats.concat(chatId);
            user
                .save()
                .then((model) => res.json(model))
                .catch((err) => res.status(400).json(err));
        })
        .catch((err) => res.status(404).json(err));
};

/**
 * DELETE any user
 * @TODO CURRENTLY NOT WORKING, FIX AND UPDATE
 * @param userId user id
 * @return user
 */
exports.deleteUser = async (req, res) => {
    const { userId } = req.params;
    userSchema.findByIdAndDelete(userId, function (err) {
        if (!err) {
            return res.status(200).json(null);
        }
        return res.status(400).send();
    });
};
