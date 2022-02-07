const router = require("express").Router();
const { permit } = require('../middlewares/auth.middleware');
const { ADMIN, STUDENT, INSTRUCTOR } = require('../constants/roles.constant');
let controller = require("../controllers/mediaReview.controller");
router.get("/:mediaAssignId", permit(STUDENT), controller.findByMediaReviewId);
router.get("/getAssignMediaRating/:mediaAssignId", permit(ADMIN, INSTRUCTOR), controller.getAssignMediaRating);
router.post("/", permit(STUDENT), controller.create);
router.delete("/:id", permit(STUDENT, ADMIN), controller.deleteById);
module.exports = router;
