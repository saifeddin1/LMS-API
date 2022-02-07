let InstructorNiv = require("../models/instructorNiv.model");

const { connection } = require('../connection');
connection.once("open", () => {
    // init stream
    console.log("*** INSTRUCTOR NIV CONTROLLER ***")
});

/**
 * GET all instructorNivs
 * @return all instructorNivs
 */
exports.getAll = async (req, res) => {
    InstructorNiv.find()
        .then((instructorNivs) => res.status(200).json(instructorNivs))
        .catch((err) => res.status(400).json(`Error: ${err}`));
};

/**
 * GET instructorNivs by userId
 * @param userId: userId
 * @return instructorNiv[]
 */
exports.findByUserId = async (req, res) => {
    const { userId } = req.params
    InstructorNiv.find({ userId: userId }).populate({ path: 'niveauId', select: 'name tag' })
        .then((instructorNivs) => res.status(200).json(instructorNivs))
        .catch((err) => res.status(400).json(err));
};

/**
 * POST new instructorNiv
 * @param req { niveauId, userId }
 * @return instructorNiv
 */
exports.create = async (req, res) => {
    const { niveauId, userId } = req.body;
    const newInstructorNiv = new InstructorNiv({ niveauId, userId });
    newInstructorNiv
        .save()
        .then(() => res.json(newInstructorNiv))
        .catch((err) => res.status(400).json(err));
};

/**
 * Delete instructorNiv
 * @param _id instructorNiv id
 * @return instructorNiv
 */
exports.deleteById = async (req, res) => {
    InstructorNiv.findByIdAndDelete({ _id: req.params.id })
        .then((instructorNiv) => res.status(200).json(instructorNiv))
        .catch((err) => res.status(404).json(err));
};
