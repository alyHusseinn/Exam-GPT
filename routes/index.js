const examControllers = require("../controllers/exam.controllers");
const teacherControllers = require("../controllers/teacher.controllers");
const authControllers = require("../controllers/auth.controllers");
const checkJWT = require("../middlewares/checkJWT");
const checkRole = require("../middlewares/checkRole");
const router = require('express').Router();

router.get("/", function (req, res, next) {
  res.redirect("/home");
});
/* GET home page. */
router.get("/home", checkJWT, teacherControllers.getHomePage);
router.get("/teacher/:id", checkJWT, teacherControllers.getTeacher);

// Exam routes
router.get("/exam/:id", examControllers.exam_get);
router.post(
  "/exam",
  [checkJWT,
  checkRole("teacher")],
  examControllers.exam_create
);
router.post("/exam/id", checkJWT, checkRole("student"), examControllers.exam_submit);

// Auth routesd
router.get("/signup", authControllers.signup_get);
router.post("/signup", authControllers.signup_post);
router.get("/login", authControllers.login_get);
router.post("/login", authControllers.login_post);
router.post('/logout', authControllers.logout_post);

module.exports = router;