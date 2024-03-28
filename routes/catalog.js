var express = require("express");
var router = express.Router();

const studentControllers = require("../controllers/student.controllers");
const examControllers = require("../controllers/exam.controllers");
const teacherControllers = require("../controllers/teacher.controllers");
const authControllers = require("../controllers/auth.controllers");

/* GET home page. */
router.get("/home", teacherControllers.getAllTeachers);

router.get("/teacher/:id", teacherControllers.getTeacherById);

// Exam routes
router.get("/exam/:id", examControllers.exam_get);
router.post("/exam", examControllers.exam_create);
router.post("/exam/id", examControllers.exam_submit);
// Auth routes
router.get("/signup", authControllers.signup_get);
router.post("/signup", authControllers.signup_post);

router.get("/login", authControllers.login_get);
router.post("/login", authControllers.login_post);

module.exports = router;
