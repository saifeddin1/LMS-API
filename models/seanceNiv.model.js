const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const seanceNivSchema = new Schema({
    seanceId: {
        type: mongoose.Types.ObjectId,
        ref: "Seance",
        required: true
    },
    niveauId: {
        type: mongoose.Types.ObjectId,
        ref: "Niveau",
        required: true
    }
}, { timestamps: true });
const SeanceNiv = mongoose.model("SeanceNiv", seanceNivSchema);
module.exports = SeanceNiv;
