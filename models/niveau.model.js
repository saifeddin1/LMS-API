const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * Schema for Niveau
 * @property {String}   name        name of niveau
 * @property {String}   tag         tag of niveau
 * @property {Number}   order       tag of niveau
 * @property {Boolean}  isPublic    isPublic of niveau
 * @property {Boolean}  enabled     enabled of niveau
 */
const niveauSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: "name is required",
    },
    tag: {
        type: String,
        trim: true,
        default: ""
    },
    order: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    enabled: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

const Niveau = mongoose.model("Niveau", niveauSchema);

module.exports = Niveau;
