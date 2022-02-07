const router = require("express").Router();
let userController = require("../controllers/user.controller");
const { permit } = require('../middlewares/auth.middleware');
const { ADMIN, INSTRUCTOR, STUDENT } = require('../constants/roles.constant');

router.get("/search/:query", permit(STUDENT, INSTRUCTOR, ADMIN), userController.search);
router.get("/getAllInstructors", permit(ADMIN), userController.getAllInstructors);
router.get("/getAllInstructorsNames", permit(ADMIN,INSTRUCTOR), userController.getAllInstructorsNames);
router.get("/getAllStudents", permit(ADMIN), userController.getAllStudents);
router.get("/getUser", permit(STUDENT, INSTRUCTOR, ADMIN), userController.getUser);
router.get("/getUserById/:id", permit(STUDENT, INSTRUCTOR, ADMIN), userController.getUserById);
router.put("/editProfile", permit(STUDENT, INSTRUCTOR, ADMIN), userController.editProfile);
router.put("/editUser", permit(STUDENT, INSTRUCTOR, ADMIN), userController.editUser);
router.put("/editById/:id", permit(ADMIN), userController.editById);
router.put("/password", userController.updatePassword);
router.put("/updateCredit", permit(STUDENT, INSTRUCTOR, ADMIN), userController.updateCredit);
router.put("/addChat", permit(STUDENT, INSTRUCTOR, ADMIN), userController.addChat);
router.delete("/deleteUser/:userId", permit(ADMIN), userController.deleteUser);

module.exports = router;
