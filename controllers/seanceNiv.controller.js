let SeanceNiv = require("../models/seanceNiv.model");

const { connection } = require('../connection');
connection.once("open", () => {
    // init stream
    console.log("*** SEANCE NIV CONTROLLER ***")
});

/**
 * GET all SeanceNivs
 * @return all SeanceNivs
 */
exports.getAll = async (req, res) => {
    SeanceNiv.find()
        .then((SeanceNivs) => res.status(200).json(SeanceNivs))
        .catch((err) => res.status(400).json(`Error: ${err}`));
};

/**
 * GET SeanceNivs by seanceId
 * @param seanceId: seanceId
 * @return seanceNiv[]
 */
exports.findBySeanceId = async (req, res) => {
    const { seanceId } = req.params
    SeanceNiv.find({ seanceId: seanceId }).populate({ path: 'niveauId', select: 'name' })
        .then((SeanceNivs) => res.status(200).json(SeanceNivs))
        .catch((err) => res.status(400).json(err));
};

/**
 * POST new seanceNiv
 * @param req { niveauId, seanceId }
 * @return seanceNiv
 */
exports.create = async (req, res) => {
    const { niveauId, seanceId } = req.body;
    const newDoc = new SeanceNiv({ niveauId, seanceId });
    newDoc
        .save()
        .then(() => res.json(newDoc))
        .catch((err) => res.status(400).json(err));
};

/**
 * Delete seanceNiv
 * @param _id seanceNiv id
 * @return seanceNiv
 */
exports.deleteById = async (req, res) => {
    SeanceNiv.findByIdAndDelete({ _id: req.params.id })
        .then((seanceNiv) => res.status(200).json(seanceNiv))
        .catch((err) => res.status(404).json(err));
};
