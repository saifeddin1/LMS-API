const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * Schema for MediaReview
 * @property {String}   name        name of mediaReview
 * @property {String}   description desc. of mediaReview
 */
const mediaReviewSchema = new Schema({
    mediaAssignId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        trim: true,
    },
}, { timestamps: true });

const MediaReview = mongoose.model("MediaReview", mediaReviewSchema);

module.exports = MediaReview;
