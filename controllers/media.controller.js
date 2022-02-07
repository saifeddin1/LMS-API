let Media = require("../models/media.model");
const mongoose = require("mongoose");

let gfs;
const { connection } = require('../connection');
connection.once("open", () => {
    // init stream
    console.log("*** MEDIA CONTROLLER ***")
    gfs = new mongoose.mongo.GridFSBucket(connection.db, {
        bucketName: "media_uploads",
    });
});

/**
 * GET all medias
 * @return all medias
 */
exports.getAll = async (req, res) => {
    Media.find().populate("type")
        .then((medias) => res.status(200).json(medias))
        .catch((err) => res.status(400).json(`Error: ${err}`));
};

/**
 * GET media by id
 * @param id: media id
 * @return media
 */
exports.findById = async (req, res) => {
    const { id } = req.params;
    Media.findById(id).populate("type")
        .then((media) => {
            if (!media) return res.status(404).json("Media Not Found");
            res.json(media);
        })
        .catch((err) => res.status(404).json(err));
};

/**
* GET mediaAssign by search query
* @param query the search query
* @return array of mediaAssign that satisfy the query
*
*/
exports.search = async (req, res) => {
    const { page, limit, text } = req.query;
    var pageNumber = 0;
    var limitNumber = 10;
    var pageText = "";
    if (page) pageNumber = Number(page);
    if (limit) limitNumber = Number(limit);
    if (text && text != "" && text != undefined && text != null) pageText = text;
    console.log("pageText : ", pageText);
    Media.aggregate([
        {
            '$lookup': {
                'from': 'mediatypes',
                'localField': 'type',
                'foreignField': '_id',
                'as': 'type'
            }
        },
        { '$unwind': "$type" },
        {
            '$match': text && text != "" ? {
                '$or': [
                    { 'name': { '$regex': text.trim(), '$options': 'i' } },
                    { 'category': { '$regex': text.trim(), '$options': 'i' } },
                    { 'type.name': { '$regex': text.trim(), '$options': 'i' } },
                ]
            } : {},
        },
        {
            '$facet': {
                'totalData': [
                    {
                        '$sort': { '_id': -1 }
                    },
                    {
                        '$skip': Math.floor(pageNumber * limitNumber),
                    },
                    {
                        '$limit': limitNumber,
                    },
                ],
                'totalCount': [
                    {
                        '$count': 'count',
                    },
                ],
            },
        },
        {
            '$unwind': {
                'path': '$totalCount',
                'preserveNullAndEmptyArrays': false
            }
        }
    ])
        .then((mediaAssign) => {
            res.json(mediaAssign && mediaAssign.length ? mediaAssign[0] : null);
        })
        .catch((err) => res.status(404).json(err));
};

/**
 * POST new media
 * @param req { _id, name, description, type, nbrMois, prix, pourcentageRemise }
 * @return media
 */
exports.create = async (req, res) => {
    const newDc = new Media(req.body);
    newDc
        .save()
        .then(() => res.json(newDc))
        .catch((err) => res.status(400).json(err));
};

/**
 * PUT update media
 * @param req { _id, name, description, type, nbrMois, prix, pourcentageRemise }
 * @param _id media id
 * @return media
 */
exports.updateById = async (req, res) => {
    const { id } = req.params;
    Media.findByIdAndUpdate(id, req.body, { new: true })
        .then((media) => res.json(media))
        .catch((err) => res.status(404).json(err));
};

/**
 * POST uploading media image
 * @param id media id
 */
exports.uploadImage = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("req.params.id :", id);
        Media
            .findById(id)
            .then((media) => {
                console.log("req.files[0].id :", req.files[0].id);
                console.log("media.img :", media.img);
                if (!media.img) media.img = req.files[0].id;
                else {
                    console.log("delete section");
                    gfs.delete(new mongoose.Types.ObjectId(media.img), (err, data) => {
                        if (err) {
                            console.log("delete section error :", JSON.stringify(err.message));
                        } else {
                            console.log("Deleted.")
                        }
                    });
                    media.img = req.files[0].id;
                }
                media.save()
                    .then((savedDoc) => res.status(200).json(savedDoc))
                    .catch((err) => res.json(err));
            })
            .catch((err) => res.status(400).json(`Error finding Media: ${err}`));
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
    console.log("req.params.id : ", req.params.id);
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
 * Delete media
 * @param _id media id
 * @return media
 */
exports.deleteById = async (req, res) => {
    Media.findById({ _id: req.params.id })
        .then((media) => {
            if (media.img) {
                gfs.delete(new mongoose.Types.ObjectId(media.img), (err, data) => {
                    if (err) {
                        console.log("delete section error :", JSON.stringify(err.message));
                    }
                });
            }
            media.remove();
            res.status(204).json()
        })
        .catch((err) => res.status(404).json(err));
};