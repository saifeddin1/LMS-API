let SeanceNivMat = require("../models/seanceNivMat.model");
const { connection } = require('../connection');
connection.once("open", () => {
    // init stream
    console.log("*** SEANCE NIVMAT ROUTER ***")
});

/**
 * GET all seanceNivMats
 * @return all seanceNivMats
 */
exports.getAll = async (req, res) => {
    SeanceNivMat.find()
        .then((seanceNivMats) => res.status(200).json(seanceNivMats))
        .catch((err) => res.status(400).json(`Error: ${err}`));
};

/**
 * GET seanceNivMats by seanceId
 * @param seanceId: seanceId
 * @return seanceNivMat[]
 */
exports.bySeanceIdNivId = async (req, res) => {
    const { seanceId, nivId } = req.params
    SeanceNivMat.find({ seanceId: seanceId, niveauId: nivId })
        .populate({
            path: 'nivMatId',
            populate: {
                path: 'matiere',
            }
        }).then((seanceNivMats) => res.status(200).json(seanceNivMats))
        .catch((err) => res.status(400).json(err));
};

/**
 * POST new seanceNivMat
 * @param req { niveauId, seanceId , nivMatId }
 * @return seanceNivMat
 */
exports.create = async (req, res) => {
    const { niveauId, seanceId, nivMatId } = req.body;
    const newDoc = new SeanceNivMat({ niveauId, seanceId, nivMatId });
    newDoc
        .save()
        .then(() => res.json(newDoc))
        .catch((err) => res.status(400).json(err));
};

/**
 * Delete seanceNivMat
 * @param _id seanceNivMat id
 * @return seanceNivMat
 */
exports.deleteById = async (req, res) => {
    SeanceNivMat.findByIdAndDelete({ _id: req.params.id })
        .then((seanceNivMat) => res.status(200).json(seanceNivMat))
        .catch((err) => res.status(404).json(err));
};