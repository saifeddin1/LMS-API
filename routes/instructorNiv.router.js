const router = require("express").Router();
const { permit } = require('../middlewares/auth.middleware');
const { ADMIN, INSTRUCTOR, STUDENT } = require('../constants/roles.constant');
const controller = require("../controllers/instructorNiv.controller");
router.get("/", permit(STUDENT, INSTRUCTOR, ADMIN), controller.getAll);
router.get("/byUserId/:userId", permit(STUDENT, INSTRUCTOR, ADMIN), controller.findByUserId);
router.post("/", permit(INSTRUCTOR, ADMIN), controller.create);
router.delete("/:id", permit(INSTRUCTOR, ADMIN), controller.deleteById);
module.exports = router;