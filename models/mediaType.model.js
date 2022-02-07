const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * Schema for MediaType
 * @property {String}   name        name of mediaType
 * @property {String}   description desc. of mediaType
 */
const mediaTypeSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: "name is required",
    },
    nameSingulier: {
        type: String,
        trim: true,
        required: "name is required",
    },
    category: {
        type: String,
        enum: {
            values: ['PRIVATE', 'PUBLIC'],
            message: "category Should be in ['PRIVATE', 'PUBLIC']"
        },
        default: "PRIVATE"
    },
    order: {
        type: Number,
        default: 0
    },
    enabled: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

const MediaType = mongoose.model("MediaType", mediaTypeSchema);

module.exports = MediaType;
