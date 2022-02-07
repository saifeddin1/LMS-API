let Matiere = require("../models/matiere.model");
const mongoose = require("mongoose");

let gfs;
const { connection } = require('../connection');
connection.once("open", () => {
    // init stream
    console.log("*** MATIERE CONTROLLER ***")
    gfs = new mongoose.mongo.GridFSBucket(connection.db, {
        bucketName: "matiere_uploads",
    });
});

/**
 * GET all matieres
 * @return all matieres
 */
exports.getAll = async (req, res) => {
    console.log("*** MATIERE CONTROLLER : GET ALL ***")
    Matiere.find()
        .then((matieres) => res.status(200).json(matieres))
        .catch((err) => res.status(400).json(`Error: ${err}`));
};

/**
 * GET matiere by id
 * @param id: matiere id
 * @return matiere
 */
exports.findById = async (req, res) => {
    Matiere.findById(req.params.id)
        .then((matiere) => {
            if (!matiere) return res.status(404).json("Matiere Not Found");
            res.json(matiere);
        })
        .catch((err) => res.status(404).json(err));
};

/**
* GET matieres by search query
* @param query the search query
* @return array of matieres that satisfy the query
*
*/
exports.search = async (req, res) => {
    const { query } = req.params;
    Matiere.find({
        '$or': [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }).then((matieres) => {
        res.json(matieres);
    }).catch((err) => res.status(404).json(err));
};

/**
 * POST new matiere
 * @param req { _id, name, description }
 * @return matiere
 */
exports.create = async (req, res) => {
    const { _id, name, description, niveauId } = req.body;
    const newMatiere = new Matiere({
        _id,
        name,
        description,
        niveauId
    });
    newMatiere
        .save()
        .then(() => res.json(newMatiere))
        .catch((err) => res.status(400).json(err));
};

/**
 * POST uploading matiere image
 * @param id matiere id
 */
exports.uploadImage = async (req, res) => {
    try {
        console.log("req.params.id :", req.params.id);
        Matiere
            .findById(req.params.id)
            .then((matiere) => {
                console.log("matiere");
                console.log("req.files[0].id :", req.files[0].id);
                if (matiere.img === "") matiere.img = req.files[0].id;
                else {
                    console.log("delete section");
                    gfs.delete(new mongoose.Types.ObjectId(matiere.img), (err, data) => {
                        if (err) {
                            console.log("delete section error :", JSON.stringify(err.message));
                        }
                    });
                    matiere.img = req.files[0].id;
                }
                matiere.save()
                    .then((savedDoc) => res.status(200).json(savedDoc))
                    .catch((err) => res.json(err));
            })
            .catch((err) => res.status(400).json(`Error finding matiere: ${err}`));
    } catch (error) {
        console.error("Method : uploadImage Error :", error);
    }
};

/**
* GET file by id
* @param id file id
* @return file
*/
exports.findFileById = async (req, res) => {
    gfs
        .find({
            _id: mongoose.Types.ObjectId(req.params.id),
        })
        .toArray((err, files) => {
            if (!files || files.length === 0) {
                return res.status(404).json({
                    err: "no files exist",
                });
            }
            gfs.openDownloadStream(mongoose.Types.ObjectId(req.params.id)).pipe(res);
        });
};

/**
 * PUT update matiere
 * @param req { _id, name, description }
 * @param _id matiere id
 * @return matiere
 */
exports.updateById = async (req, res) => {
    Matiere.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        .then((matiere) => res.status(200).json(matiere))
        .catch((err) => res.status(404).json(err));
};

/**
 * Delete matiere
 * @param _id matiere id
 * @return matiere
 */
exports.deleteById = async (req, res) => {
    Matiere.findByIdAndDelete({ _id: req.params.id })
        .then((matiere) => res.status(200).json(matiere))
        .catch((err) => res.status(404).json(err));
};