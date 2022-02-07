const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const instructorNivMatSchema = new Schema({
    niveauId: {
        type: mongoose.Types.ObjectId,
        ref: "Niveau",
        required: true
    },
    userId: {
        type: String,
        ref: "User",
        required: true
    },
    nivMatId: {
        type: mongoose.Types.ObjectId,
        ref: "NivMat",
        required: true
    },
}, { timestamps: true });

const InstructorNivMat = mongoose.model("InstructorNivMat", instructorNivMatSchema);

module.exports = InstructorNivMat;
