const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const nivMatChapSchema = new Schema({
    nivMatId: {
        type: mongoose.Types.ObjectId,
        ref: "NivMat",
        required: true
    },
    chapitreId: {
        type: mongoose.Types.ObjectId,
        ref: "Chapitre",
        required: true
    },
    order: {
        type: Number,
        default: 0
    },
    locked: {
        type: Boolean,
        default: true
    },
    enabled: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

nivMatChapSchema.index({
    nivMatId: 1,
    chapitreId: 1,
  }, {
    unique: true,
  });

const NivMatChap = mongoose.model("NivMatChap", nivMatChapSchema);

module.exports = NivMatChap;
