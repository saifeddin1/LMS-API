let NivMatChap = require("../models/nivmatChap.model");
let Chapitre = require("../models/chapitre.model");
const mongoose = require("mongoose");
const { connection } = require('../connection');
const { ADMIN, INSTRUCTOR } = require("../constants/roles.constant");
connection.once("open", () => {
    console.log("*** NIV MAT CHAP CONTROLLER ***");
});
/**
 * GET all chapitres
 * @return all chapitres
 */
exports.getAll = async (req, res) => {
    const { nivId, matNivId } = req.params
    console.log("matNivId :", matNivId)
    console.log("nivId :", nivId)
    const query = [
        {
            '$match': {
                'nivMatId': new mongoose.Types.ObjectId(matNivId)
            }
        }, {
            '$lookup': {
                'from': 'chapitres',
                'localField': 'chapitreId',
                'foreignField': '_id',
                'as': 'chapitre'
            }
        },
        {
            '$unwind': {
                'path': '$chapitre'
            }
        },
        {
            '$addFields': {
                'chapitreId': "$chapitre._id",
                'name': '$chapitre.name',
                'description': '$chapitre.description'
            }
        }, {
            '$group': {
                '_id': '$nivMatId',
                'nivMatChaps': {
                    '$push': '$$ROOT'
                }
            }
        }, {
            '$lookup': {
                'from': 'nivmats',
                'let': {
                    'nivMatId': '$_id'
                },
                'pipeline': [
                    {
                        '$match': {
                            '$expr': {
                                '$eq': [
                                    '$_id', '$$nivMatId'
                                ]
                            }
                        }
                    }, {
                        '$lookup': {
                            'from': 'matieres',
                            'localField': 'matiere',
                            'foreignField': '_id',
                            'as': 'matiere'
                        }
                    }, {
                        '$lookup': {
                            'from': 'niveaus',
                            'localField': 'niveau',
                            'foreignField': '_id',
                            'as': 'niveau'
                        }
                    }
                ],
                'as': 'nivMat'
            }
        }, {
            '$unwind': '$nivMat'
        }, {
            '$unwind': '$nivMat.matiere'
        }, {
            '$unwind': '$nivMat.niveau'
        }, {
            '$match': {
                'nivMat.niveau._id': new mongoose.Types.ObjectId(nivId)
            }
        }
    ]
    NivMatChap.aggregate(query)
        .then((model) => {
            if (model && model.length) {
                res.status(200).json(model[0])
            } else {
                res.status(200).json(null)
            }
        })
        .catch((err) => res.status(400).json(`Error: ${err}`));
};

/**
 * GET chapitres and NivMat and Matiere by NivMat id
 * @param id: nivmat id
 * @return nivmat with matiere and chapitres
 */
exports.getAllByNivMatId = async (req, res) => {
    const { nivId, nivMatId } = req.params
    console.log("nivMatId :", nivMatId)
    console.log("nivId :", nivId)


    const { user } = req
    var condition = {
        nivMatId: ''
    }
    if (user.type == ADMIN) {
        condition = {
            nivMatId: new mongoose.Types.ObjectId(nivMatId),
        }
    }
    else if (user.studentOffreId || user.type == INSTRUCTOR) {
        console.log("user.studentOffreId :", user.studentOffreId);
        condition = {
            nivMatId: new mongoose.Types.ObjectId(nivMatId),
            enabled: true
        }
    } else {
        // internaut / visitor
        console.log("internaut / visitor");
        condition = {
            nivMatId: new mongoose.Types.ObjectId(nivMatId),
            // enabled: true,
            locked: true
        }
    }



    const query = [
        {
            '$match': condition
        }, {
            '$lookup': {
                'from': 'chapitres',
                'localField': 'chapitreId',
                'foreignField': '_id',
                'as': 'chapitre'
            }
        }, {
            '$unwind': '$chapitre'
        }, {
            '$group': {
                '_id': '$nivMatId',
                'chapitres': {
                    '$addToSet': {
                        '_id': '$chapitre._id',
                        'name': '$chapitre.name',
                        'description': '$chapitre.description',
                        'order': '$order',
                        'locked': '$locked',
                        'enabled': '$enabled'
                    }
                }
            }
        }, {
            '$lookup': {
                'from': 'nivmats',
                'let': {
                    'nivMatId': '$_id'
                },
                'pipeline': [
                    {
                        '$match': {
                            '$expr': {
                                '$eq': [
                                    '$_id', '$$nivMatId'
                                ]
                            }
                        }
                    }, {
                        '$lookup': {
                            'from': 'matieres',
                            'localField': 'matiere',
                            'foreignField': '_id',
                            'as': 'matiere'
                        }
                    }, {
                        '$lookup': {
                            'from': 'niveaus',
                            'localField': 'niveau',
                            'foreignField': '_id',
                            'as': 'niveau'
                        }
                    }
                ],
                'as': 'nivMat'
            }
        }, {
            '$unwind': '$nivMat'
        }, {
            '$replaceRoot': {
                'newRoot': {
                    '$mergeObjects': [
                        '$nivMat', {
                            'chapitres': '$chapitres'
                        }
                    ]
                }
            }
        }, {
            '$unwind': '$matiere'
        }, {
            '$unwind': '$niveau'
        }, {
            '$match': {
                'niveau._id': new mongoose.Types.ObjectId(nivId)
            }
        }
    ]
    NivMatChap.aggregate(query)
        .then((model) => {
            if (model && model.length) {
                res.status(200).json(model[0])
            } else {
                res.status(200).json(null)
            }
        })
        .catch((err) => res.status(400).json(`Error: ${err}`));
};

/**
 * GET nivMatChap by id
 * @param id: nivMatChap id
 * @return nivMatChap
 */
exports.findById = async (req, res) => {
    NivMatChap.findById(req.params.id)
        .then((nivMatChap) => {
            if (!nivMatChap) return res.status(404).json("NivMatChap Not Found");
            res.json(nivMatChap);
        })
        .catch((err) => res.status(404).json(err));
};

/**
 * GET nivMatChap by MatiereId
 * @param id: matiere id
 * @return [chaptires]
 */
exports.ByNivMatId = async (req, res) => {
    console.log("req.params.id", req.params.id);
    NivMatChap.find({ nivMatId: new mongoose.Types.ObjectId(req.params.id) }).sort({ order: 1 })
        .then((chapitres) => {
            res.json(chapitres);
        })
        .catch((err) => res.status(404).json(err));
};

/**
 * POST new nivMatChap
 * @param req { _id, name, description }
 * @return nivMatChap
 */
exports.create = async (req, res) => {
    const { nivMatId, chapitreId, locked, enabled, order } = req.body;
    const newNivMatChap = new NivMatChap({
        nivMatId,
        chapitreId,
        locked,
        enabled,
        order
    });
    newNivMatChap
        .save()
        .then(() => res.json(newNivMatChap))
        .catch((err) => res.status(400).json(err));
};

exports.createWithChapitre = async (req, res) => {
    const { name, description, nivMatId, locked, enabled, order } = req.body;
    const newChapitre = new Chapitre({
        name,
        description,
    });
    newChapitre
        .save()
        .then((newChapitreModel) => {
            console.log("new Chapitre Model : ", newChapitreModel);
            const newNivMatChap = new NivMatChap({
                nivMatId,
                chapitreId: newChapitreModel._id,
                locked,
                enabled,
                order
            });
            newNivMatChap
                .save()
                .then((newNivMatChapModel) => {
                    console.log("new NivMatChap Model : ", newNivMatChapModel);
                    res.json({ ...JSON.parse(JSON.stringify(newNivMatChap)), name: newChapitre.name })
                })
                .catch((err) => res.status(400).json(err));
        })
        .catch((err) => res.status(400).json(err));
};

/**
 * PUT update nivMatChap
 * @param req { _id, name, description }
 * @param _id nivMatChap id
 * @return nivMatChap
 */
exports.updateById = async (req, res) => {
    NivMatChap.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        .then((nivMatChap) => res.status(200).json(nivMatChap))
        .catch((err) => res.status(404).json(err));
};

/**
 * PUT update nivMatChap
 * @param req { _id, name, description }
 * @param _id nivMatChap id
 * @return nivMatChap
 */
exports.editwithChapitre = async (req, res) => {
    // const {chapId}
    console.log("req.body : ", req.body);
    const { _id, name, description, nivMatId, chapitreId, locked, enabled } = req.body

    Chapitre.findByIdAndUpdate({ _id: chapitreId }, { name, description }, { new: true })
        .then((chap) => {

            NivMatChap.findByIdAndUpdate({ _id: _id }, { locked, enabled }, { new: true })
                .then((nivMatChap) => {
                    return res.json({ ...JSON.parse(JSON.stringify(nivMatChap)), name: chap.name, description: chap.description })
                })
                .catch((err) => res.status(404).json(err));

        })
        .catch((err) => res.status(404).json(err));

};

/**
 * PUT update NivMatChap  Orders
 * @param req { data: { _id: string, order: number }[]}
 * @param _id NivMatChap id
 * @return null
 */
// router.route("/editOrders").put(async (req, res) => {
exports.editOrders = async (req, res) => {
    try {
        console.log("editOrders");
        const { data } = req.body
        console.log("data : ", data);
        if (data && data.length) {
            await Promise.all(req.body.data.map(async (el) => {
                console.log("el :", el);
                await NivMatChap.findByIdAndUpdate(
                    { _id: new mongoose.Types.ObjectId(el._id) },
                    { order: el.order }, { new: true, upsert: true })
            }));
            return res.status(204).json()
        }
    } catch (error) {
        console.log("error :", error);
        return res.status(500).json(error);
    }
};

/**
 * Delete nivMatChap
 * @param _id nivMatChap id
 * @return nivMatChap
 */
exports.deleteById = async (req, res) => {
    NivMatChap.findByIdAndDelete({ _id: req.params.id })
        .then((nivMatChap) => res.status(200).json(nivMatChap))
        .catch((err) => res.status(404).json(err));
};