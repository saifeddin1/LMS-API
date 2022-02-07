const router = require("express").Router();
const loginController = require("../controllers/auth/login.controller.js");
const registerController = require("../controllers/auth/register.controller.js");
const { permit } = require('../middlewares/auth.middleware');
const { ADMIN, INSTRUCTOR, STUDENT } = require('../constants/roles.constant');
router.post('/register', registerController.register);
router.post('/login/:email', loginController.login);
router.post('/logout', permit(STUDENT, INSTRUCTOR, ADMIN), loginController.logout);
module.exports = router;
