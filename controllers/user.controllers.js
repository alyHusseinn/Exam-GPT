const User = require('../models/user')
const Exam = require('../models/exam')
const Submition = require('../models/submition')
const asyncHandler = require('express-async-handler')
/* const { body, validationResult } = require('express-validator'); */

exports.getHomePage = asyncHandler(async (req, res) => {
  const teachers = await User.find({ role: 'teacher' })
    .select('-password')
    .exec()
  res.render('home', {
    title: 'home',
    teachers: teachers
  })
})
// fib function

exports.getTeacher = asyncHandler(async (req, res) => {
  const [teacher, exams] = await Promise.all([
    User.findById(req.params.id).select('-password').exec(),
    Exam.find({ teacher: req.params.id })
      .select('topic numberOfQuestions type')
      .exec()
  ])

  // if teacher doesn't exist in database return 404

  if (!teacher) {
    const error = new Error('Teacher not found')
    error.status = 404
    throw error
  }
  res.render('teacher_profile', {
    title: `${teacher.username}'s profile`,
    teacher,
    exams
  })
})

exports.getStudent = asyncHandler(async (req, res) => {
  const submitions = await Submition.find({ student: req.user.id })
    .select('-wrongAnswers -answers')
    .populate('exam', 'topic')
    .exec();

  res.render('student_profile', {
    title: `${req.user.username}'s profile`,
    submitions
  })
})
