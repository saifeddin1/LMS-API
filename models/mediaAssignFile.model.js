const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * Schema for MediaAssignFile
 * @property {String}   mediaId        name of MediaAssignFile
 * @property {String}   chapitreId        name of MediaAssignFile
 * @property {Number}   order         image. of MediaAssignFile
 * @property {Boolean}  locked        dynamic type
 * @property {Boolean}  enabled        dynamic type
 */
const mediaAssignFileSchema = new Schema({
    mediaId: {
        type: mongoose.Types.ObjectId,
        ref: "Media",
        required: true
    },
    mediaAssignId: {
        type: mongoose.Types.ObjectId,
        required: true
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

const MediaAssignFile = mongoose.model("MediaAssignFile", mediaAssignFileSchema);

module.exports = MediaAssignFile;
