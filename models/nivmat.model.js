const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * Schema for nivMat
 * @property {String}   name    name of nivMat
 * @property {String}   matiere matiere of nivMat
 * @property {String}   niveau  niveau of nivMat
 * @property {Boolean}  enabled enabled of nivMat
 */
const nivMatSchema = new Schema({
    order: {
        type: Number,
        default: 0
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    matiere: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Matiere'
    },
    niveau: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Niveau'
    },
    enabled: {
        type: Boolean,
        default: true
    },
    locked: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

const NivMat = mongoose.model("NivMat", nivMatSchema);

module.exports = NivMat;
