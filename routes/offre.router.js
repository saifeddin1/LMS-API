const controller = require("../controllers/offre.controller");
const { permit } = require('../middlewares/auth.middleware');
const { ADMIN, INSTRUCTOR, STUDENT } = require('../constants/roles.constant');
const router = require("express").Router();
const multer = require("multer");
const crypto = require("crypto");
const GridFsStorage = require("multer-gridfs-storage");
require("dotenv").config();
const DB_URI = process.env.DB_URI;
const storage = new GridFsStorage({
    url: DB_URI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = file.originalname;
                const fileInfo = {
                    filename: filename,
                    bucketName: "offre_uploads",
                };
                resolve(fileInfo);
            });
        });
    },
});

const upload = multer({ storage: storage });
router.get("/", permit(STUDENT, INSTRUCTOR, ADMIN), controller.getAll);
router.get("/:id", permit(STUDENT, INSTRUCTOR, ADMIN), controller.findById);
router.get("/search/:query", permit(STUDENT, INSTRUCTOR, ADMIN), controller.search);
router.get("/documents/:id", controller.findFileById);
router.post("/", permit(INSTRUCTOR, ADMIN), controller.create);
router.post("/:id/uploadImage", permit(INSTRUCTOR, ADMIN), upload.array("document", 1), controller.uploadImage);
router.put("/:id", permit(INSTRUCTOR, ADMIN), controller.updateById);
router.delete("/:id", permit(INSTRUCTOR, ADMIN), controller.deleteById);
module.exports = router;
