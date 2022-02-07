const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * Schema for Chapitre
 * @property {String}   name        name of chapitre
 * @property {String}   description desc. of chapitre
 */
const chapitreSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: "name is required"
    },
    description: {
        type: String,
        trim: true,
        default: ""
    }
}, { timestamps: true });

const Chapitre = mongoose.model("Chapitre", chapitreSchema);

module.exports = Chapitre;
