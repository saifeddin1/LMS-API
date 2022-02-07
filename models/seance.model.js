const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * Schema for Seance
 * @property {String}   name        name of seance
 * @property {String}   description desc. of seance
 * @property {String}   url         url. of seance
 * @property {String}   niveauId    niveauId. of seance
 */
const seanceSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: "name is required",
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    url: {
        type: String,
        trim: true,
        required: "url is required",
    },
    urlInstructor: {
        type: String,
        trim: true,
    },
    urlAuthInstructor: {
        type: String,
        trim: true,
    },
    startDate: {
        type: Date,
        required: "startDate is required",
    },
    endDate: {
        type: Date,
        required: "endDate is required",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
}, { timestamps: true });

const Seance = mongoose.model("Seance", seanceSchema);

module.exports = Seance;