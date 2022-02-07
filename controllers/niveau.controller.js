let Niveau = require("../models/niveau.model");
let NivMat = require("../models/nivmat.model");
let InstructorNiv = require("../models/instructorNiv.model");
let InstructorNivMat = require("../models/instructorNivMat.model");

const mongoose = require("mongoose");
const { connection } = require('../connection');
const { ADMIN, INSTRUCTOR } = require("../constants/roles.constant");
connection.once("open", () => {
    console.log("*** NIVEAU CONTROLLER ***");
});

/**
 * GET all niveaux
 * @return all niveaux
 */
exports.getAll = async (req, res) => {
    const { user } = req
    if (user && user.type === ADMIN) {
        Niveau.find().sort({ order: 1 })
            .then((niveaus) => res.status(200).json(niveaus))
            .catch((err) => res.status(400).json(`Error: ${err}`));
    } else if (user && user.type === INSTRUCTOR) {
        InstructorNiv.aggregate([
            {
                '$match': {
                    'userId': user._id
                }
            }, {
                '$lookup': {
                    'from': 'niveaus',
                    'localField': 'niveauId',
                    'foreignField': '_id',
                    'as': 'niveau'
                }
            }, {
                '$unwind': {
                    'path': '$niveau',
                    'preserveNullAndEmptyArrays': false
                }
            }, {
                '$replaceRoot': {
                    'newRoot': '$niveau'
                }
            }
        ]).then((instructorNivs) => res.status(200).json(instructorNivs))
            .catch((err) => res.status(400).json(err));
    }
};

/**
 * GET all niveaux for users
 * @return all niveaux
 */
exports.getAllForUsers = async (req, res) => {
    Niveau.find({ 'isPublic': true }).sort({ 'order': 1 })
        .then((niveaus) => res.status(200).json(niveaus))
        .catch((err) => res.status(400).json(`Error: ${err}`));
};

/**
 * GET all niveaux with matieres
 * @param id: niveau id
 * @return all niveaux
 */
exports.withMatieres = async (req, res) => {
    console.log("withMatieres :");
    const { user } = req
    if (user && user.type === ADMIN) {
        Niveau.aggregate([
            {
                '$match': {
                    '_id': new mongoose.Types.ObjectId(req.params.id)
                }
            }, {
                '$lookup': {
                    'from': 'nivmats',
                    'localField': '_id',
                    'foreignField': 'niveau',
                    'as': 'nivmat'
                }
            }, {
                '$unwind': {
                    'path': '$nivmat',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$lookup': {
                    'from': 'matieres',
                    'localField': 'nivmat.matiere',
                    'foreignField': '_id',
                    'as': 'nivmat.matiere'
                }
            }, {
                '$unwind': {
                    'path': '$nivmat.matiere',
                    'preserveNullAndEmptyArrays': true
                }
            },
            {
                '$sort': {
                    'nivmat.order': 1
                }
            },
            {
                '$group': {
                    '_id': '$_id',
                    'name': {
                        '$first': '$name'
                    },
                    'nivmats': {
                        '$push': {
                            '_id': '$nivmat._id',
                            'order': '$nivmat.order',
                            'name': '$nivmat.matiere.name',
                            'matiere': '$nivmat.matiere._id',
                            'userId': '$nivmat.userId',
                            'enabled': '$nivmat.enabled',
                            'locked': '$nivmat.locked'
                        }
                    }
                }
            }
        ]).then((niveau) => {
            if (niveau && niveau.length)
                res.status(200).json(niveau[0]);
            else res.status(400).json(`Niveau Not Found.`)
        }).catch((err) => res.status(400).json(`Error: ${err}`));
    } else if (user && user.type === INSTRUCTOR) {
        InstructorNivMat.aggregate([
            {
                '$match': {
                    'userId': user._id,
                    'niveauId': new mongoose.Types.ObjectId(req.params.id)
                }
            }, {
                '$group': {
                    '_id': '$niveauId',
                    'root': {
                        '$first': '$$ROOT'
                    }
                }
            }, {
                '$lookup': {
                    'from': 'niveaus',
                    'localField': '_id',
                    'foreignField': '_id',
                    'as': 'niveau'
                }
            }, {
                '$unwind': {
                    'path': '$niveau',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$lookup': {
                    'from': 'nivmats',
                    'let': {
                        'nivMatId': '$root.nivMatId'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$and': [
                                        { '$eq': ['$_id', '$$nivMatId'] },
                                        { '$eq': ['$userId', new mongoose.Types.ObjectId(user._id)] },
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
                            '$unwind': {
                                'path': '$matiere',
                                'preserveNullAndEmptyArrays': true
                            }
                        }
                    ],
                    'as': 'nivMat'
                }
            }, {
                '$unwind': {
                    'path': '$nivMat',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$sort': {
                    'nivmat.order': 1
                }
            }, {
                '$project': {
                    '_id': 1,
                    'name': '$niveau.name',
                    'nivmat': '$nivMat'
                }
            }, {
                '$group': {
                    '_id': '$_id',
                    'name': {
                        '$first': '$name'
                    },
                    'nivmats': {
                        '$push': {
                            '_id': '$nivmat._id',
                            'order': '$nivmat.order',
                            'name': '$nivmat.matiere.name',
                            'matiere': '$nivmat.matiere._id',
                            'userId': '$nivmat.userId',
                            'enabled': '$nivmat.enabled',
                            'locked': '$nivmat.locked'
                        }
                    }
                }
            }
        ]).then((niveau) => {
            if (niveau && niveau.length)
                res.status(200).json(niveau[0]);
            else res.status(400).json(`Niveau Not Found.`)
        }).catch((err) => res.status(400).json(`Error: ${err}`));
    }
};

/**
 * GET niveau by id
 * @param id: niveau id
 * @return niveau
 */
exports.findById = async (req, res) => {
    Niveau.findById(req.params.id)
        .then((niveau) => {
            if (!niveau) return res.status(404).json("Niveau Not Found");
            res.json(niveau);
        })
        .catch((err) => res.status(404).json(err));
};

/**
 * GET niveau by id
 * @param id: niveau id
 * @return nivmats[]
 */
exports.getAllMatieresById = async (req, res) => {
    console.log("getAllMatieresById");
    const { id } = req.params;
    console.log("NivId :", id);
    const { user } = req
    var query
    if (user.type == ADMIN) {
        query = {
            niveau: new mongoose.Types.ObjectId(id),
        }
    }
    else if (user.studentOffreId || user.type == INSTRUCTOR) {
        console.log("user.studentOffreId :", user.studentOffreId);
        query = {
            niveau: new mongoose.Types.ObjectId(id),
            enabled: true
        }
    } else {
        // internaut / visitor
        console.log("internaut / visitor");
        query = {
            niveau: new mongoose.Types.ObjectId(id),
            // enabled: true,
            locked: true
        }
    }
    NivMat.find(query).populate("matiere").sort({ order: 1 })
        .then((nivmats) => {
            res.json(nivmats);
        })
        .catch((err) => res.status(404).json(err));
};

/**
 * GET niveau by id
 * @param id: niveau id
 * @return nivmats[]
 */
exports.getMatiereByNivMatId = async (req, res) => {
    console.log("getAllMatieresById");
    const { id } = req.params;
    console.log("NivId :", id);
    NivMat.findOne({ _id: new mongoose.Types.ObjectId(id) }).populate("matiere").populate("niveau").sort({ order: 1 })
        .then((nivmat) => {
            res.json(nivmat);
        })
        .catch((err) => res.status(404).json(err));
};

/**
 * GET niveau by id
 * @param id: niveau id
 * @return nivmats[]
 */
exports.getSeeMoreByNiveauId = async (req, res) => {
    var limit = 10;
    if (req.query.limit) limit = Number(req.query.limit)
    const { nivId, nivMatId } = req.params;
    console.log({ nivId, nivMatId });
    NivMat.aggregate([
        {
            '$match': {
                'niveau': new mongoose.Types.ObjectId(nivId),
                '_id': {
                    '$ne': new mongoose.Types.ObjectId(nivMatId)
                }
            }
        },
        {
            '$lookup': {
                'from': 'nivmatchaps',
                'let': {
                    'id': '$_id',
                },
                'pipeline': [
                    {
                        '$match': {
                            '$expr':
                            {
                                '$eq': ['$nivMatId', '$$id'],
                            }
                        },
                    },
                    {
                        '$count': 'count',
                    },
                ],
                'as': 'chaps',
            }
        },
        {
            '$unwind': {
                'path': '$chaps',
                'preserveNullAndEmptyArrays': true
            }
        },
        {
            '$lookup': {
                'from': 'matieres',
                'localField': 'matiere',
                'foreignField': '_id',
                'as': 'matiere'
            }
        },
        {
            '$unwind': '$matiere'
        },
        {
            '$sort': {
                'order': 1
            }
        },
        {
            '$limit': limit
        }
    ])
        .then((nivmats) => {
            res.json(nivmats);
        })
        .catch((err) => res.status(404).json(err));
};

/**
* GET niveaus by search query
* @param query the search query
* @return array of niveaus that satisfy the query
*
*/
exports.search = async (req, res) => {
    const { query } = req.params;
    Niveau.find({
        $or: [
            { name: { $regex: query, $options: "i" } },
        ]
    }).then((niveaus) => {
        res.json(niveaus);
    }).catch((err) => res.status(404).json(err));
};

/**
 * POST new niveau
 * @param req { name, order, tag, isPublic }
 * @return niveau
 */
exports.createNiv = async (req, res) => {
    const { name, order, tag, isPublic } = req.body;
    const newNiveau = new Niveau({ name, order, tag, isPublic });
    newNiveau.save()
        .then((savedDoc) => res.json(savedDoc))
        .catch((err) => res.status(400).json(err));
};

/**
 * POST new niveau
 * @param req { matiere, niveau, enabled, order }
 * @return niveau
 */
exports.createNivMat = async (req, res) => {
    const { matiere, niveau, enabled, userId, locked, order } = req.body;
    const newNivMat = new NivMat({
        matiere,
        userId,
        niveau,
        enabled,
        locked,
        order
    });
    newNivMat
        .save()
        .then((savedDoc) => {
            return res.json(savedDoc)
        })
        .catch((err) => res.status(400).json(err));
};

/**
 * PUT update niveau  Orders
 * @param req { nivs: { _id: string, order: number }[]}
 * @param _id niveau id
 * @return niveau
 */
exports.editNivsOrders = async (req, res) => {
    try {
        if (req.body && req.body.nivs && req.body.nivs.length) {
            await Promise.all(req.body.nivs.map(async (el) => {
                console.log("el :", el);
                await Niveau.findByIdAndUpdate(
                    { _id: new mongoose.Types.ObjectId(el._id) },
                    { order: el.order }, { new: true, upsert: true })
            }));
            return res.status(204).json()
        }
    } catch (error) {
        return res.status(500).json(error);
    }
};

/**
 * PUT update niveau Matieres Orders
 * @param req { nivMats: { _id: string, order: number }[]}
 * @param _id niveau id
 * @return niveau
 */
exports.editMatieresOrders = async (req, res) => {
    try {
        if (req.body && req.body.nivMats && req.body.nivMats.length) {
            await Promise.all(req.body.nivMats.map(async (el) => {
                console.log("el :", el);
                await NivMat.findByIdAndUpdate(
                    { _id: new mongoose.Types.ObjectId(el._id) },
                    { order: el.order }, { new: true, upsert: true })
            }));
            return res.status(204).json()
        }
    } catch (error) {
        return res.status(500).json(error);
    }
};

/**
* PUT update niveau
* @param req 
* @param _id niveau id
* @return niveau
*/
exports.editNivMatById = async (req, res) => {
    console.log("req.params.id :", req.params.id);
    NivMat.findByIdAndUpdate({ _id: new mongoose.Types.ObjectId(req.params.id) },
        req.body,
        { new: true })
        .then((nivMat) => {
            return res.status(200).json(nivMat)
        })
        .catch((err) => res.status(404).json(err));
};

/**
* PUT update niveau
* @param req { name, order, tag, isPublic, enabled }
* @param _id niveau id
* @return niveau
*/
exports.updateById = async (req, res) => {
    Niveau.findByIdAndUpdate({ _id: new mongoose.Types.ObjectId(req.params.id) }, req.body, { new: true })
        .then((niveau) => {
            return res.status(200).json(niveau)
        })
        .catch((err) => res.status(404).json(err));
};

/**
 * Delete niveau
 * @param _id niveau id
 * @return niveau
 */
exports.deleteNivById = async (req, res) => {
    Niveau.findByIdAndDelete({ _id: req.params.id })
        .then((niveau) => res.status(200).json(niveau))
        .catch((err) => res.status(404).json(err));
};

/**
 * Delete niveau
 * @param _id niveau id
 * @return niveau
 */
exports.deleteNivMatById = async (req, res) => {
    NivMat.findByIdAndDelete({ _id: req.params.id })
        .then((niveau) => res.status(200).json(niveau))
        .catch((err) => res.status(404).json(err));
};