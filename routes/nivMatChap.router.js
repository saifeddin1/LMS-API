const router = require("express").Router();
const { permit } = require('../middlewares/auth.middleware');
const { ADMIN, INSTRUCTOR, STUDENT } = require('../constants/roles.constant');
let controller = require("../controllers/nivMatChap.controller");
router.get("/getAll/:nivId/:matNivId", permit(STUDENT, INSTRUCTOR, ADMIN), controller.getAll);
router.get("/getAllByNivMatId/:nivId/:nivMatId", permit(STUDENT, INSTRUCTOR, ADMIN), controller.getAllByNivMatId);
router.get("/:id", permit(STUDENT, INSTRUCTOR, ADMIN), controller.findById);
router.get("/ByNivMatId/:id", permit(STUDENT, INSTRUCTOR, ADMIN), controller.ByNivMatId);
router.post("/", permit(INSTRUCTOR, ADMIN), controller.create);
router.post("/createWithChapitre", permit(STUDENT, INSTRUCTOR, ADMIN), controller.createWithChapitre);
router.put("/:id", permit(INSTRUCTOR, ADMIN), controller.updateById);
router.put("/editwithChapitre/:id", permit(INSTRUCTOR, ADMIN), controller.editwithChapitre);
router.put("/editOrders/:id", permit(INSTRUCTOR, ADMIN), controller.editOrders);
router.delete("/:id", permit(INSTRUCTOR, ADMIN), controller.deleteById);
module.exports = router;
