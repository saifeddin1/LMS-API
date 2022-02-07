let MediaReview = require("../models/mediaReview.model");
const mongoose = require("mongoose");
const { connection } = require('../connection');
connection.once("open", () => {
    console.log("*** MEDIA REVIEW CONTROLLER ***");
});

/**
 * GET mediaReview by userId && mediaAssignId
 * @param req: mediaAssignId && userId
 * @return mediaReview
 */
exports.findByMediaReviewId = async (req, res) => {
    const { mediaAssignId } = req.params;
    console.log("mediaAssignId :", mediaAssignId);
    const { user } = req
    if (!user) return res.statsus(404).json("User Not Found");
    MediaReview.findOne({
        userId: user._id,
        mediaAssignId: mongoose.Types.ObjectId(mediaAssignId)
    }).then((mediaReview) => {
        // if (!mediaReview) return res.status(404).json("MediaReview Not Found");
        res.json(mediaReview);
    }).catch((err) => res.status(404).json(err));
};

/**
 * Get Assign Media Rating by mediaAssignId
 * @param req: mediaAssignId 
 * @return AssignMedia Rating
 */
exports.getAssignMediaRating = async (req, res) => {
    const { mediaAssignId } = req.params;
    console.log("mediaAssignId :", mediaAssignId);
    MediaReview.aggregate([
        {
            '$match': { 'mediaAssignId': mongoose.Types.ObjectId(mediaAssignId) }
        },
        {
            '$group': {
                '_id': "groupId",
                'count': {
                    '$sum': 1
                },
                'sum': {
                    '$sum': "$rate"
                },
            }
        }
    ]).then((result) => {
        if (!result || !result.length || !result[0].count || !result[0].sum) {
            res.json({ sum: 0, count: 0, percent: 0 })
        } else {
            result = result[0]
            res.json({ sum: result.sum, count: result.count, percent: result.sum / result.count });

        }
    }).catch((err) => res.status(404).json(err));
};

/**
 * POST new mediaReview
 * @param req { name, description, order, enabled }
 * @return mediaReview
 */
exports.create = async (req, res) => {
    const { user } = req
    if (!user) return res.statsus(404).json("User Not Found");
    req.body["userId"] = user._id
    const newDc = new MediaReview(req.body);
    newDc.save()
        .then(() => res.json(newDc))
        .catch((err) => res.status(400).json(err));
};

/**
 * Delete mediaReview
 * @param _id mediaReview id
 * @return mediaReview
 */
exports.deleteById = async (req, res) => {
    const { id } = req.params;
    MediaReview.findByIdAndDelete({ _id: id })
        .then((mediaReview) => res.status(200).json(mediaReview))
        .catch((err) => res.status(404).json(err));
};