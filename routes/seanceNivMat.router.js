const router = require("express").Router();
const { permit } = require('../middlewares/auth.middleware');
const { ADMIN, INSTRUCTOR, STUDENT } = require('../constants/roles.constant');
const controller = require("../controllers/seanceNivMat.controller");
router.get("/", permit(STUDENT, INSTRUCTOR, ADMIN), controller.getAll);
router.get("/bySeanceIdNivId/:seanceId/:nivId", permit(STUDENT, INSTRUCTOR, ADMIN), controller.bySeanceIdNivId);
router.post("/", permit(INSTRUCTOR, ADMIN), controller.create);
router.delete("/:id", permit(INSTRUCTOR, ADMIN), controller.deleteById);
module.exports = router;