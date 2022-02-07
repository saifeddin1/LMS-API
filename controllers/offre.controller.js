let Offre = require("../models/offre.model");
const mongoose = require("mongoose");
let gfs;
const { connection } = require('../connection');
connection.once("open", () => {
    // init stream
    console.log("*** OFFRE CONTROLLER ***")
    gfs = new mongoose.mongo.GridFSBucket(connection.db, {
        bucketName: "offre_uploads",
    });
});

/**
 * GET all offres
 * @return all offres
 */
exports.getAll = async (req, res) => {
    Offre.find()
        .then((offres) => res.status(200).json(offres))
        .catch((err) => res.status(400).json(`Error: ${err}`));
};


/**
 * GET offre by id
 * @param id: offre id
 * @return offre
 */
exports.findById = async (req, res) => {
    Offre.findById(req.params.id)
        .then((offre) => {
            if (!offre) return res.status(404).json("Offre Not Found");
            res.json(offre);
        })
        .catch((err) => res.status(404).json(err));
};

/**
* GET offres by search query
* @param query the search query
* @return array of offres that satisfy the query
*
*/
exports.search = async (req, res) => {
    const { query } = req.params;
    Offre.find({
        $or: [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { type: { $regex: query, $options: "i" } },
        ],
    })
        .then((offres) => {
            res.json(offres);
        })
        .catch((err) => res.status(404).json(err));
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
 * POST new offre
 * @param req { _id, name, description, type, nbrMois, prix, pourcentageRemise }
 * @return offre
 */
exports.create = async (req, res) => {
    const newOffre = new Offre(req.body);
    newOffre
        .save()
        .then(() => res.json(newOffre))
        .catch((err) => res.status(400).json(err));
};

/**
 * POST uploading offre image
 * @param id offre id
 */
 exports.uploadImage = async (req, res) => {
    try {
        console.log("req.params.id :", req.params.id);
        Offre
            .findById(req.params.id)
            .then((offre) => {
                console.log("offre");
                console.log("req.files[0].id :", req.files[0].id);
                if (offre.img === "") offre.img = req.files[0].id;
                else {
                    console.log("delete section");
                    gfs.delete(new mongoose.Types.ObjectId(offre.img), (err, data) => {
                        if (err) {
                            console.log("delete section error :", JSON.stringify(err.message));
                        }
                    });
                    offre.img = req.files[0].id;
                }
                offre.save()
                    .then((savedDoc) => res.status(200).json(savedDoc))
                    .catch((err) => res.json(err));
            })
            .catch((err) => res.status(400).json(`Error finding Offre: ${err}`));
    } catch (error) {
        console.error("Method : uploadImage Error :", error);
    }
};

/**
 * PUT update offre
 * @param req { _id, name, description, type, nbrMois, prix, pourcentageRemise }
 * @param _id offre id
 * @return offre
 */
exports.updateById = async (req, res) => {
    Offre.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then((offre) => res.json(offre))
        .catch((err) => res.status(404).json(err));
};

/**
 * Delete offre
 * @param _id offre id
 * @return offre
 */
exports.deleteById = async (req, res) => {
    Offre.findByIdAndDelete({ _id: req.params.id })
        .then((offre) => res.status(200).json(offre))
        .catch((err) => res.status(404).json(err));
};