const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const seanceNivMatSchema = new Schema({
    seanceId: {
        type: mongoose.Types.ObjectId,
        ref: "Seance",
        required: true
    },
    niveauId: {
        type: mongoose.Types.ObjectId,
        ref: "Niveau",
        required: true
    },
    nivMatId: {
        type: mongoose.Types.ObjectId,
        ref: "NivMat",
        required: true
    },
}, { timestamps: true });
const SeanceNivMat = mongoose.model("SeanceNivMat", seanceNivMatSchema);
module.exports = SeanceNivMat;
