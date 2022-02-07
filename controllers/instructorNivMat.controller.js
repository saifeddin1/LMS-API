let InstructorNivMat = require("../models/instructorNivMat.model");
const { connection } = require('../connection');
connection.once("open", () => {
    // init stream
    console.log("*** INSTRUCTOR NIVMAT ROUTER ***")
});

/**
 * GET all instructorNivMats
 * @return all instructorNivMats
 */
exports.getAll = async (req, res) => {
    InstructorNivMat.find()
        .then((instructorNivMats) => res.status(200).json(instructorNivMats))
        .catch((err) => res.status(400).json(`Error: ${err}`));
};

/**
 * GET instructorNivMats by userId
 * @param userId: userId
 * @return instructorNivMat[]
 */
exports.byUserIdNivId = async (req, res) => {
    const { userId, nivId } = req.params
    InstructorNivMat.find({ userId: userId, niveauId: nivId })
        .populate({
            path: 'nivMatId',
            populate: {
                path: 'matiere',
            }
        }).then((instructorNivMats) => res.status(200).json(instructorNivMats))
        .catch((err) => res.status(400).json(err));
};

/**
 * POST new instructorNivMat
 * @param req { niveauId, userId , nivMatId }
 * @return instructorNivMat
 */
exports.create = async (req, res) => {
    const { niveauId, userId, nivMatId } = req.body;
    const newInstructorNiv = new InstructorNivMat({ niveauId, userId, nivMatId });
    newInstructorNiv
        .save()
        .then(() => res.json(newInstructorNiv))
        .catch((err) => res.status(400).json(err));
};

/**
 * Delete instructorNivMat
 * @param _id instructorNivMat id
 * @return instructorNivMat
 */
exports.deleteById = async (req, res) => {
    InstructorNivMat.findByIdAndDelete({ _id: req.params.id })
        .then((instructorNivMat) => res.status(200).json(instructorNivMat))
        .catch((err) => res.status(404).json(err));
};