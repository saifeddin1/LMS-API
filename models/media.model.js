const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * Schema for Media
 * @property {String}   name        name of Media
 * @property {String}   img         image. of Media
 * @property {String}   type        dynamic type
 */
const mediaSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: "name is required",
    },
    img: {
        type: String,
    },
    type: {
        type: mongoose.Types.ObjectId,
        ref: "MediaType"
    }
}, { timestamps: true });

const Media = mongoose.model("Media", mediaSchema);

module.exports = Media;
