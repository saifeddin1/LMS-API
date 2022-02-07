const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * Schema for Matiere
 * @property {String}   name        name of matiere
 * @property {String}   description desc. of matiere
 */
const matiereSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: "name is required"
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    img: {
        type: String,
    }
}, { timestamps: true });

const Matiere = mongoose.model("Matiere", matiereSchema);

module.exports = Matiere;
