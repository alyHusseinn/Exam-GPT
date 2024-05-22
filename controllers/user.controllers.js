const User = require('../models/user')
const Exam = require('../models/exam')
const Submition = require('../models/submition')
const asyncHandler = require('express-async-handler')
const cloudinary = require('cloudinary').v2
const {
  CLOUD_NAME,
  CLOUDINARY_KEY,
  CLOUDINARY_SECRET
} = require('../config/env')

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET
})

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

exports.getAdmin = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.user.id).select('-password').exec()
  res.render('admin_profile', {
    title: 'Admin Profile',
    admin
  })
})

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
  const [student, submitions] = await Promise.all([
    User.findById(req.params.id).select('-password').exec(),
    Submition.find({ student: req.params.id, answers: { $ne: null } })
      .select('-wrongAnswers -answers')
      .populate('exam', 'topic')
      .exec()
  ])

  res.render('student_profile', {
    title: `${req.user.username}'s profile`,
    submitions,
    student
  })
})

exports.getAllTeachers = asyncHandler(async (req, res) => {
  const teachers = await User.find({ role: 'teacher' })
    .select('-password')
    .exec()
  res.render('all_teachers', {
    title: 'All Teachers',
    teachers
  })
})

exports.getAllStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' })
    .select('-password')
    .exec()
  res.render('all_students', {
    title: 'All Students',
    students
  })
})

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    const error = new Error('User not found')
    error.status = 404
    throw error
  }

  // Find all exams created by the user
  const exams = await Exam.find({ teacher: user._id })

  // Delete all submissions associated with each exam and delete each exam
  await Promise.all(
    exams.map(async (exam) => {
      // Delete all submissions
      await Submition.deleteMany({ exam: exam._id })

      // Delete the exam
      await Exam.deleteOne({ _id: exam._id })
    })
  )

  // Delete the user
  await Submition.deleteMany({ student: user._id })
  await User.deleteOne({ _id: user._id })
  await cloudinary.uploader.destroy(user.avatar)

  res.redirect('/home')
})
