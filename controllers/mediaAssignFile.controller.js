const mongoose = require("mongoose");
let MediaAssignFile = require("../models/mediaAssignFile.model");

const { connection } = require('../connection');
connection.once("open", () => {
    console.log("*** MEDIA ASSIGN FILE ROUTER ***");
});

/**
 * GET all mediaAssignFile
 * @return all mediaAssignFile
 */
exports.getAll = async (req, res) => {
    MediaAssignFile.find().sort({ order: 1 })
        .then((mediaAssignFile) => res.status(200).json(mediaAssignFile))
        .catch((err) => res.status(400).json(`Error: ${err}`));
};

/**
 * GET mediaAssignFile by id
 * @param id: mediaAssignFile id
 * @return mediaAssignFile
 */
exports.findById = async (req, res) => {
    const { id } = req.params;
    MediaAssignFile.findById(id)
        .then((mediaAssignFile) => {
            if (!mediaAssignFile) return res.status(404).json("MediaAssignFile Not Found");
            res.json(mediaAssignFile);
        })
        .catch((err) => res.status(404).json(err));
};

/**
 * GET findByAssign by mediaAssignId
 * @param mediaAssignId: findByAssign mediaAssignId
 * @return medias
 */
exports.getAssignMediaFiles = async (req, res) => {
    const { mediaAssignId } = req.params;
    console.log("mediaAssignId : ", mediaAssignId);
    MediaAssignFile.find({
        mediaAssignId: new mongoose.Types.ObjectId(mediaAssignId),
    }).populate("mediaId").sort({ order: 1 })
        .then((docs) => {
            res.json(docs);
        })
        .catch((err) => res.status(404).json(err));
};

/**
 * POST new mediaAssignFile
 * @param req 
 * @return mediaAssignFile
 */
exports.create = async (req, res) => {
    const newDoc = new MediaAssignFile(req.body);
    newDoc
        .save()
        .then(() => res.json(newDoc))
        .catch((err) => res.status(400).json(err));
};

/**
 * PUT update Orders
 * @param req 
 * @param _id id
 * @return Doc
 */
exports.editOrders = async (req, res) => {
    try {
        if (req.body && req.body.data && req.body.data.length) {
            await Promise.all(req.body.data.map(async (el) => {
                console.log("el :", el);
                await MediaAssignFile.findByIdAndUpdate(
                    { _id: new mongoose.Types.ObjectId(el._id) },
                    { order: el.order }, { new: true, upsert: true })
            }));
            return res.status(204).json()
        }
    } catch (error) {
        console.error("error : ", error);
        return res.status(500).json(error);
    }
};

/**
 * PUT update mediaAssignFile
 * @param req 
 * @param _id mediaAssignFile id
 * @return mediaAssignFile
 */
exports.updateById = async (req, res) => {
    MediaAssignFile.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then((mediaAssignFile) => res.json(mediaAssignFile))
        .catch((err) => res.status(404).json(err));
};


/**
 * Delete mediaAssignFile
 * @param _id mediaAssignFile id
 * @return mediaAssignFile
 */
exports.deleteById = async (req, res) => {
    MediaAssignFile.findByIdAndDelete({ _id: req.params.id })
        .then((mediaAssignFile) => res.status(200).json(mediaAssignFile))
        .catch((err) => res.status(404).json(err));
};
