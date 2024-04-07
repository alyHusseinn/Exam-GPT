const examControllers = require('../controllers/exam.controllers')
const userControllers = require('../controllers/user.controllers')
const authControllers = require('../controllers/auth.controllers')
const checkJWT = require('../middlewares/checkJwt')
const checkRole = require('../middlewares/checkRole')
const router = require('express').Router()

router.get('/', function (req, res, next) {
  res.redirect('/home')
})
/* GET home page. */
router.get('/home', checkJWT, userControllers.getHomePage)
router.get('/teacher/:id', checkJWT, userControllers.getTeacher)
router.get('/student/:id', checkJWT, userControllers.getStudent);

// Exam routes
router.get('/exam/:id', checkJWT, examControllers.exam_get);
router.get('/submition/:id', checkJWT, examControllers.exam_results_get);

// post a new exam
router.post(
  '/exam',
  [checkJWT, checkRole('teacher')],
  examControllers.exam_create
)
// submit an exam
router.post(
  '/exam/:id',
  [checkJWT, checkRole('student')],
  examControllers.exam_submit
)

router.post('/exam/:id/delete', [checkJWT, checkRole('teacher')], examControllers.exam_delete)

// Auth routesd
router.get('/signup', authControllers.signup_get)
router.post('/signup', authControllers.signup_post)
router.get('/login', authControllers.login_get)
router.post('/login', authControllers.login_post)
router.post('/logout', authControllers.logout_post)

module.exports = router