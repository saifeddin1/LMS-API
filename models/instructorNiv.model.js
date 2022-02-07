const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const instructorNivSchema = new Schema({
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
}, { timestamps: true });

const InstructorNiv = mongoose.model("InstructorNiv", instructorNivSchema);

module.exports = InstructorNiv;