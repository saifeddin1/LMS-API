let MediaType = require("../models/mediaType.model");
const mongoose = require("mongoose");

const { connection } = require('../connection');
connection.once("open", () => {
    console.log("*** MEDIA TYPE CONTROLLER ***");
});

/**
 * GET all mediaTypes
 * @return all mediaTypes
 */
exports.getAll = async (req, res) => {
    MediaType.find().sort({ order: 1 })
        .then((mediaTypes) => res.status(200).json(mediaTypes))
        .catch((err) => res.status(400).json(`Error: ${err}`));
};

/**
 * GET all Public mediaTypes 
 * @return all mediaTypes
 */
exports.getPublicMediaTypes = async (req, res) => {
    MediaType.find({ category: "PUBLIC" }).sort({ order: 1 })
        .then((mediaTypes) => res.status(200).json(mediaTypes))
        .catch((err) => res.status(400).json(`Error: ${err}`));
};

/**
 * GET mediaType by id
 * @param id: mediaType id
 * @return mediaType
 */
exports.findById = async (req, res) => {
    const { id } = req.params;
    MediaType.findById(id)
        .then((mediaType) => {
            if (!mediaType) return res.status(404).json("MediaType Not Found");
            res.json(mediaType);
        })
        .catch((err) => res.status(404).json(err));
};

/**
* GET mediaTypes by search query
* @param query the search query
* @return array of mediaTypes that satisfy the query
*
*/
exports.search = async (req, res) => {
    const { query } = req.params;
    MediaType.find({ name: { $regex: query, $options: "i" } })
        .then((mediaTypes) => {
            res.json(mediaTypes);
        })
        .catch((err) => res.status(404).json(err));
};

/**
 * POST new mediaType
 * @param req { name, description, order, enabled }
 * @return mediaType
 */
exports.create = async (req, res) => {
    const newDc = new MediaType(req.body);
    newDc
        .save()
        .then(() => res.json(newDc))
        .catch((err) => res.status(400).json(err));
};


/**
 * PUT update Orders
 * @param req { data: { _id: string, order: number }[]}
 * @param _id id
 * @return Doc
 */
exports.editOrders = async (req, res) => {

    try {
        if (req.body && req.body.data && req.body.data.length) {
            await Promise.all(req.body.data.map(async (el) => {
                console.log("el :", el);
                await MediaType.findByIdAndUpdate(
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
 * PUT update mediaType
 * @param req { _id, name, description, order, enabled }
 * @param _id mediaType id
 * @return mediaType
 */
exports.updateById = async (req, res) => {
    MediaType.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then((mediaType) => res.json(mediaType))
        .catch((err) => res.status(404).json(err));
};


/**
 * Delete mediaType
 * @param _id mediaType id
 * @return mediaType
 */
exports.deleteById = async (req, res) => {
    MediaType.findByIdAndDelete({ _id: req.params.id })
        .then((mediaType) => res.status(200).json(mediaType))
        .catch((err) => res.status(404).json(err));
};