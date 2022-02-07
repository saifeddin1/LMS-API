const router = require("express").Router();
const { permit } = require('../middlewares/auth.middleware');
const { ADMIN, INSTRUCTOR, STUDENT } = require('../constants/roles.constant');
const controller = require("../controllers/instructorNivMat.controller");
router.get("/", permit(STUDENT, INSTRUCTOR, ADMIN), controller.getAll);
router.get("/byUserIdNivId/:userId/:nivId", permit(STUDENT, INSTRUCTOR, ADMIN), controller.byUserIdNivId);
router.post("/", permit(INSTRUCTOR, ADMIN), controller.create);
router.delete("/:id", permit(INSTRUCTOR, ADMIN), controller.deleteById);
module.exports = router;