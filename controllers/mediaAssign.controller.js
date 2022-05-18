let MediaAssign = require("../models/mediaAssign.model");
let OffreModel = require("../models/offre.model");
const mongoose = require("mongoose");
const { ADMIN, INSTRUCTOR } = require("../constants/roles.constant");

const { connection } = require('../connection');
connection.once("open", () => {
    console.log("*** MEDIA ASSIGN Controller ***");
});

/**
 * GET all mediaAssign
 * @return all mediaAssign
 */
exports.getAll = async (req, res) => {
    MediaAssign.find().sort({ order: 1 })
        .then((mediaAssign) => res.status(200).json(mediaAssign))
        .catch((err) => res.status(400).json(`Error: ${err}`));
};

/**
 * GET mediaAssign by id
 * @param id: mediaAssign id
 * @return mediaAssign
 */
exports.findById = async (req, res) => {
    const { id } = req.params;
    MediaAssign.findById(id)
        .then((mediaAssign) => {
            if (!mediaAssign) return res.status(404).json("MediaAssign Not Found");
            res.json(mediaAssign);
        })
        .catch((err) => res.status(404).json(err));
};

/**
 * GET find By AssignId And MediaTypeId
 * @param mediaAssignId: mediaAssignId
 * @param mediaTypeId: mediaTypeId 
 * @return medias
 */
exports.findByAssignId = async (req, res) => {
    console.log("Media Assign Controller , method : findByAssignId");
    const { mediaAssignId, mediaTypeId } = req.params;
    const { populateFiles } = req.query;
    console.log("AssignId : ", mediaAssignId);
    console.log("mediaTypeId : ", mediaTypeId);
    console.log("populateFiles : ", populateFiles);

    var query = {
        assignId: new mongoose.Types.ObjectId(mediaAssignId)
    }
    console.log("query :", query);

    if (mediaTypeId
        && mediaTypeId != undefined
        && mediaTypeId != "undefined"
        && mediaTypeId != "null") {
        console.log("Assigning MediaTypeId ...");
        query["mediaTypeId"] = mongoose.Types.ObjectId(mediaTypeId)
    } else {
        console.log("Enregistrement MediaTypeId.");

    }
    console.log("query :", query);
    if (!populateFiles) {
        console.log("populateFiles <- false");
        MediaAssign.find(query).sort({ order: 1 })
            .then((docs) => {
                res.json(docs);
            })
            .catch((err) => res.status(404).json(err));
    } else {
        console.log("populateFiles <- true");
        MediaAssign.aggregate([
            {
                '$match': query
            },
            {
                '$lookup': {
                    'from': 'mediaassignfiles',
                    'let': {
                        'id': '$_id'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$eq': [
                                        '$mediaAssignId', '$$id'
                                    ]
                                }
                            }
                        }, {
                            '$lookup': {
                                'from': 'media',
                                'localField': 'mediaId',
                                'foreignField': '_id',
                                'as': 'media'
                            }
                        }, {
                            '$unwind': {
                                'path': '$media',
                                'preserveNullAndEmptyArrays': true
                            }
                        }, {
                            '$lookup': {
                                'from': 'mediatypes',
                                'localField': 'media.type',
                                'foreignField': '_id',
                                'as': 'media.type'
                            }
                        }, {
                            '$unwind': {
                                'path': '$media.type',
                                'preserveNullAndEmptyArrays': true
                            }
                        }
                    ],
                    'as': 'medias'
                }
            },
            {
                '$addFields': {
                    'files': '$medias.media'
                }
            },
            {
                '$unset': [
                    'medias'
                ]
            },
            {
                '$addFields': {
                    'videoSources': [{
                        'src': "$videoUrl",
                        'provider': 'youtube',
                    }]
                }
            },
            {
                '$sort': {
                    'order': 1
                }
            }
        ])
            .then((docs) => {
                res.json(docs);
            })
            .catch((err) => res.status(404).json(err));
    }
};

/**
 * GET find By AssignId And MediaTypeId
 * @param mediaAssignId: mediaAssignId
 * @param mediaTypeId: mediaTypeId 
 * @return medias
 */
exports.findByAssignIdForStudent = async (req, res) => {
    console.log("Media Assign Controller : findByAssignIdForStudent ");
    const { user } = req
    const { mediaAssignId, mediaTypeId } = req.params;
    const { populateFiles } = req.query;
    console.log("AssignId : ", mediaAssignId);
    console.log("mediaTypeId : ", mediaTypeId);
    console.log("populateFiles : ", populateFiles);
    var restriction = {};
    console.log("restriction :", restriction);
    var offre
    if (user && user.studentOffreId) {
        console.log("user.studentOffreId :", user.studentOffreId);
        offre = await OffreModel.findById(user.studentOffreId);
        if (offre) {
            console.log("offre :", offre);
            if (!offre.withVideo) {
                restriction["videoUrl"] = -1
                restriction["videoSources"] = -1
            }
            if (!offre.withPDFCourses) { restriction["files"] = -1 }
            if (!offre.withRecord &&
                (!mediaTypeId
                    || mediaTypeId == undefined
                    || mediaTypeId == "undefined"
                    || mediaTypeId == "null")
            ) {
                return []
            }
            console.log("restriction in offre true :", restriction);
        }
    }
    console.log("restriction :", restriction);
    var query = {
        assignId: mongoose.Types.ObjectId(mediaAssignId)
    }
    if (mediaTypeId
        && mediaTypeId != undefined
        && mediaTypeId != "undefined"
        && mediaTypeId != "null") {
        query["mediaTypeId"] = mongoose.Types.ObjectId(mediaTypeId)
    }
    if (user.type == ADMIN) {
        //code here
    }
    else if (user.studentOffreId || user.type == INSTRUCTOR) {
        console.log("user.studentOffreId :", user.studentOffreId);
        query["enabled"] = true
    } else {
        // internaut / visitor
        console.log("internaut / visitor");
        // query["enabled"] = true
        query["locked"] = true
    }
    if (!populateFiles || restriction.files) {
        console.log("!populateFiles || restriction.files : true");
        if (ObjNotNull(restriction)) {
            restriction = {
                '$unset': Object.keys(restriction).map(key => key)
            }
            const aggregation = [
                { '$match': query },
                { '$sort': { order: 1 } },
                {
                    '$addFields': {
                        'videoSources': [{
                            'src': "$videoUrl",
                            'provider': 'youtube',
                        }]
                    }
                },
                {
                    '$sort': {
                        'order': 1
                    }
                },
                ...ObjCond(restriction)

            ]
            console.log("aggregation :", aggregation)
            MediaAssign.aggregate(aggregation)
                .then((docs) => {
                    res.json(docs);
                })
                .catch((err) => res.status(404).json(err));
        } else {
            console.log("MediaAssign ...");
            console.log("query : ", query);
            MediaAssign.aggregate([
                { '$match': query },
                {
                    '$addFields': {
                        'videoSources': [{
                            'src': "$videoUrl",
                            'provider': 'youtube',
                        }]
                    }
                },
                { '$sort': { 'order': 1 } },
            ]).then((docs) => {
                res.json(docs);
            }).catch((err) => res.status(404).json(err));

        }

    } else if (populateFiles || !restriction.files) {
        console.log("populateFiles || !restriction.files : true");
        if (ObjNotNull(restriction)) {
            restriction = {
                '$unset': Object.keys(restriction).map(key => key)
            }
        }
        MediaAssign.aggregate([
            {
                '$match': query
            },
            {
                '$lookup': {
                    'from': 'mediaassignfiles',
                    'let': {
                        'id': '$_id'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$eq': [
                                        '$mediaAssignId', '$$id'
                                    ]
                                }
                            }
                        }, {
                            '$lookup': {
                                'from': 'media',
                                'localField': 'mediaId',
                                'foreignField': '_id',
                                'as': 'media'
                            }
                        }, {
                            '$unwind': {
                                'path': '$media',
                                'preserveNullAndEmptyArrays': true
                            }
                        }, {
                            '$lookup': {
                                'from': 'mediatypes',
                                'localField': 'media.type',
                                'foreignField': '_id',
                                'as': 'media.type'
                            }
                        }, {
                            '$unwind': {
                                'path': '$media.type',
                                'preserveNullAndEmptyArrays': true
                            }
                        }
                    ],
                    'as': 'medias'
                }
            },
            {
                '$addFields': {
                    'files': '$medias.media'
                }
            },
            {
                '$unset': [
                    'medias'
                ]
            },
            {
                '$addFields': {
                    'videoSources': [{
                        'src': "$videoUrl",
                        'provider': 'youtube',
                    }]
                }
            },
            {
                '$sort': {
                    'order': 1
                }
            },
            ...ObjCond(restriction)
        ])
            .then((docs) => {
                res.json(docs);
            })
            .catch((err) => res.status(404).json(err));
    }
};

ObjCond = (obj) => ObjNotNull(obj) ? [obj] : [];
ObjNotNull = (obj) => obj && Object.keys(obj).length ? true : false;

/**
 * POST new mediaAssign
 * @param req 
 * @return mediaAssign
 */
exports.create = async (req, res) => {
    const newDoc = new MediaAssign(req.body);
    console.log("newDoc :", newDoc);
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
                await MediaAssign.findByIdAndUpdate(
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
 * PUT update mediaAssign
 * @param req { _id, name, description, order, enabled }
 * @param _id mediaAssign id
 * @return mediaAssign
 */
exports.updateById = async (req, res) => {
    console.log("updateById :", req.body);
    MediaAssign.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then((mediaAssign) => res.json(mediaAssign))
        .catch((err) => res.status(404).json(err));
};


/**
 * Delete mediaAssign
 * @param _id mediaAssign id
 * @return mediaAssign
 */
exports.deleteById = async (req, res) => {
    MediaAssign.findByIdAndDelete({ _id: req.params.id })
        .then((mediaAssign) => res.status(200).json(mediaAssign))
        .catch((err) => res.status(404).json(err));
};
