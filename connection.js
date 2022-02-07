const mongoose = require("mongoose");
require("dotenv").config();
const DB_URI = process.env.DB_URI;

mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

const connection = mongoose.connection;

connection.once("open", () => {
    console.log("Connection Router");
    console.log("MongoDB connected!");
    console.log(`Your port is ${process.env.DB_URI}`);
});

exports.connection = connection;