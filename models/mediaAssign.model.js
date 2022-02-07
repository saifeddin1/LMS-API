const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * Schema for MediaAssign
 * @property {String}   mediaId        name of MediaAssign
 * @property {String}   chapitreId        name of MediaAssign
 * @property {Number}   order         image. of MediaAssign
 * @property {Boolean}  locked        dynamic type
 * @property {Boolean}  enabled        dynamic type
 */
const mediaAssignSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    mediaTypeId: {
        type: mongoose.Types.ObjectId,
        ref: "MediaType"
    },
    assignId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    videoUrl: {
        type: String,
        default: "-"
    },
    videoEnabled: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        required: true
    },
    locked: {
        type: Boolean,
        default: true,
    },
    enabled: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const MediaAssign = mongoose.model("MediaAssign", mediaAssignSchema);

module.exports = MediaAssign;
