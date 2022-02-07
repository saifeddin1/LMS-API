let Chapitre = require("../models/chapitre.model");

const { connection } = require('../connection');
connection.once("open", () => {
    // init stream
    console.log("*** CHAPITRE ROUTER ***")
});

/**
 * GET all chapitres
 * @return all chapitres
 */
exports.getAll = async (req, res) => {
    Chapitre.find().then((models) => {
        res.status(200).json(models)
    }).catch((err) => res.status(400).json(`Error: ${err}`));
};

/**
 * GET chapitre by id
 * @param id: chapitre id
 * @return chapitre
 */
exports.findById = async (req, res) => {
    Chapitre.findById(req.params.id)
        .then((chapitre) => {
            if (!chapitre) return res.status(404).json("Chapitre Not Found");
            res.json(chapitre);
        })
        .catch((err) => res.status(404).json(err));
};

/**
* GET chapitre by search query
* @param query the search query
* @return array of chapitre that satisfy the query
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
    Chapitre.aggregate([
        {
            '$match': text && text != "" ? {
                '$or': [
                    { 'name': { '$regex': text.trim(), '$options': 'i' } },
                    { 'description': { '$regex': text.trim(), '$options': 'i' } },
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
        .then((chapitres) => {
            res.json(chapitres && chapitres.length ? chapitres[0] : null);
        })
        .catch((err) => res.status(404).json(err));
};

/**
 * POST new chapitre
 * @param req { _id, name, description }
 * @return chapitre
 */
exports.create = async (req, res) => {
    const { name, description } = req.body;
    const newChapitre = new Chapitre({
        name,
        description,
    });
    newChapitre
        .save()
        .then(() => res.json(newChapitre))
        .catch((err) => res.status(400).json(err));
};

/**
 * PUT update chapitre
 * @param req { _id, name, description }
 * @param _id chapitre id
 * @return chapitre
 */
exports.updateById = async (req, res) => {
    Chapitre.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        .then((chapitre) => res.status(200).json(chapitre))
        .catch((err) => res.status(404).json(err));
};

/**
 * Delete chapitre
 * @param _id chapitre id
 * @return chapitre
 */
exports.deleteById = async (req, res) => {
    Chapitre.findByIdAndDelete({ _id: req.params.id })
        .then((chapitre) => res.status(200).json(chapitre))
        .catch((err) => res.status(404).json(err));
};