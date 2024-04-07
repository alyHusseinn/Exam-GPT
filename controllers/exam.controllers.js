const Exam = require('../models/exam')
const Submition = require('../models/submition')
const asyncHandler = require('express-async-handler')
const { body, validationResult } = require('express-validator')

// POST: create exam
exports.exam_create = [
  body('topic')
    .isLength({ min: 5 })
    .withMessage('Topic must be more than 5 characters'),
  body('questions_number')
    .isNumeric()
    .withMessage('Number of questions must be a number')
    .isInt({ min: 5, max: 40 })
    .withMessage('Number of questions must be between 5 and 40'),
  body('type')
    .isIn(['mcq', 'essay'])
    .withMessage("Type must be either 'mcq' or 'essay'"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.render('home', {
        title: 'Exam Form',
        errors: errors.array()
      })
    } else {
      const { topic, type, questions_number } = req.body
      const exam = new Exam({
        topic,
        type,
        numberOfQuestions: questions_number,
        teacher: req.user.id // get from the cookie middlewared
      })
      try {
        const newExam = await exam.save()
        res.redirect(newExam.url)
      } catch (err) {
        console.log(err)
      }
    }
  })
]

exports.exam_get = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id).exec()

  if (!exam) {
    const error = new Error('Exam not found')
    error.status = 404
    return next(error)
  }
  if (req.user.role === 'student') {
    // make sure that this student didn't already submit this exam
    const submitions = await Submition.find({
      exam: exam._id,
      student: req.user.id
    })
    if (submitions.length > 0) {
      return res.redirect(req.user.url)
    }
    res.render('exam_form', {
      title: 'exam form',
      exam: exam
    })
  } else {
    const examSubmitions = await Submition.find({ exam: exam._id })
      .select('-answers -wrongAnswers')
      .populate('student', '-password')
      .exec()
    res.render('exam_view', {
      title: 'Exam',
      exam: exam,
      submitions: examSubmitions
    })
  }
})

exports.exam_submit = asyncHandler(async (req, res, next) => {
  // we got the answers from the client
  // check the validity of the answers
  // and then return the exam with the correct answers
  const exam = await Exam.findById(req.params.id)

  // check if the user has submit the exam before submitting
  const submitions = await Submition.find({
    exam: exam._id,
    student: req.user.id
  })
  if (submitions.length > 0) {
    return res.redirect(exam.url)
  }

  const answers = Object.values(req.body)

  // update the schema with that information
  const submition = new Submition({
    exam: exam._id,
    student: req.user.id,
    answers
  })

  try {
    const newSubmition = await submition.save()
    await Exam.findByIdAndUpdate(req.params.id, {
      $push: { submitions: newSubmition._id }
    })
    res.redirect(newSubmition.url)
  } catch (err) {
    console.log(err)
  }
})

exports.exam_results_get = asyncHandler(async (req, res, next) => {
  const submition = await Submition.findById(req.params.id)
    .populate('exam student')
    .exec()
  if (!submition) {
    const error = new Error('Submition not found')
    error.status = 404
    return next(error)
  }
  if (
    submition.student._id.toString() !== req.user.id.toString() &&
    submition.exam.teacher.toString() !== req.user.id.toString()
  ) {
    const error = new Error('You are not authorized to view this page')
    error.status = 401
    return next(error)
  }

  res.render('exam_results', {
    title: 'Exam Result',
    submition
  })
})

exports.exam_delete = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id)
  if (!exam) {
    const error = new Error('Exam not found')
    error.status = 404
    return next(error)
  }
  if (exam.teacher.toString() != req.user.id.toString()) {
    const error = new Error('You are not authorized to delete this exam')
    error.status = 401
    return next(error)
  }
  try {
    await Exam.findByIdAndDelete(req.params.id)
    // delete all that exam submitions
    await Submition.deleteMany({ exam: req.params.id });
    res.redirect(req.user.url)
  } catch (err) {
    console.log(err)
  }
})
