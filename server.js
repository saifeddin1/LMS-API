const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
var cors = require('cors')
const app = express();

require("dotenv").config();

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

require("./seeds/user.seed.js");
const authRouter = require("./routes/auth.router");
const chatRouter = require("./routes/chat.router");
const userRouter = require("./routes/user.router");
const offreRouter = require("./routes/offre.router");
const chapitreRouter = require("./routes/chapitre.router");
const matiereRouter = require("./routes/matiere.router");
const niveauRouter = require("./routes/niveau.router");
const seanceRouter = require("./routes/seance.router");
const mediaTypeRouter = require("./routes/mediaType.router");
const mediaReviewRouter = require("./routes/mediaReview.router");
const mediaRouter = require("./routes/media.router");
const mediaAssignRouter = require("./routes/mediaAssign.router");
const mediaAssignFileRouter = require("./routes/mediaAssignFile.router");
const nivMatChapRouter = require("./routes/nivMatChap.router");
const instructorNivRouter = require("./routes/instructorNiv.router");
const instructorNivMatRouter = require("./routes/instructorNivMat.router");
const seanceNivRouter = require("./routes/seanceNiv.router");
const seanceNivMatRouter = require("./routes/seanceNivMat.router");

app.use("/api/chat", chatRouter);
app.use("/api/user", userRouter);
app.use("/api/offre", offreRouter);
app.use("/api/chapitre", chapitreRouter);
app.use("/api/matiere", matiereRouter);
app.use("/api/niveau", niveauRouter);
app.use("/api/seance", seanceRouter);
app.use("/api/mediaType", mediaTypeRouter);
app.use("/api/mediaReview", mediaReviewRouter);
app.use("/api/media", mediaRouter);
app.use("/api/mediaAssign", mediaAssignRouter);
app.use("/api/mediaAssignFile", mediaAssignFileRouter);
app.use("/api/nivMatChap", nivMatChapRouter);
app.use("/api/instructorNiv", instructorNivRouter);
app.use("/api/instructorNivMat", instructorNivMatRouter);
app.use("/api/seanceNiv", seanceNivRouter);
app.use("/api/seanceNivMat", seanceNivMatRouter);
app.use("/api/auth", authRouter);

const { connection } = require('./connection');
connection.once("open", () => {
  console.log("*** SERVER INIT ***");
});

/* Frontend Static files */

app.use(express.static(path.join(__dirname, "..", "frontend", "dist", "uimpactify-app")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "dist", "uimpactify-app", "index.html"));
});

/* Express Server */
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});

/* Socket.io Connection */

require("./routes/chat.router").listen(server);