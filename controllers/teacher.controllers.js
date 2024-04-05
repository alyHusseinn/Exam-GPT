const Teacher = require('../models/user')
const Exam = require('../models/exam')
const asyncHandler = require('express-async-handler')
/* const { body, validationResult } = require('express-validator'); */

exports.getHomePage = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find({ role: 'teacher' })
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
    Teacher.findById(req.params.id).select('-password').exec(),
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
