const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * Schema for Offre
 * @property {String}   name        name of offre
 * @property {String}   description desc. of offre
 * @property {String}   img         image. of offre
 * @property {String}   access      "VIDEOS", "FILES","LIVE"
 * @property {String}   type        "ANNUEL", "MENSULLE"
 * @property {Number}   nbrMois     months number if the type is "MENSUELLE" 
 * @property {Number}   prix        price of offre
 * @property {Number}   pourcentageRemise   pourcentageRemise of offre
 */
const offreSchema = new Schema({
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
    img: {
        type: String,
    },
    color: {
        type: String,
        default : '#00000'
    },
    type: {
        type: String,
        required: "type is required",
        enum: {
            values: ['ANNUEL', 'MENSULLE'],
            message: "type Should be in ['ANNUEL', 'MENSULLE']"
        }
    },
    options: {
        type: [String],
        required: "options is required"
    },
    nbrMois: {
        type: Number,
        default: 0
    },
    prix: {
        type: Number,
        required: "prix is required",
    },
    pourcentageRemise: {
        type: Number,
    },
    withVideo: {
        type: Boolean,
        default: false
    },
    withPDFCourses: {
        type: Boolean,
        default: false
    },
    withLive: {
        type: Boolean,
        default: false
    },
    withRecord: {
        type: Boolean,
        default: false
    },
    enabled: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Offre = mongoose.model("Offre", offreSchema);

module.exports = Offre;
