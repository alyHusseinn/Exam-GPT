const Exam = require('../models/exam')
const asyncHandler = require('express-async-handler')
const { body, validationResult } = require('express-validator')
const getWrongAnswers = require('../Ai/getWrongAnswers')

// POST: create exam
exports.exam_create = [
  body('topic')
    .isLength({ min: 5 })
    .withMessage('Topic must be more than 5 characters'),
  body('questions_number')
    .isNumeric()
    .withMessage('Number of questions must be a number'),
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
  const exam = await Exam.findById(req.params.id).select('-students').exec()

  if (!exam) {
    const error = new Error('Exam not found')
    error.status = 404
    return next(error)
  }
  if (req.user.role === 'student') {
    res.render('exam_form', {
      title: 'exam form',
      exam: exam
    })
  } else {
    res.render('exam_view', {
      title: 'Exam',
      exam: exam
    })
  }
})

exports.exam_submit = asyncHandler(async (req, res, next) => {
  // we got the answers from the client
  // check the validity of the answers
  // and then return the exam with the correct answers
  const exam = await Exam.findById(req.params.id)
  const answers = []

  Object.entries(req.body).forEach(([key, value]) => {
    answers.push(value)
  })

  const correctAnswers =
    exam.type === 'mcq'
      ? exam.mcqQuestions.map((question) => question.answer) // the index of the answer
      : exam.essayQuestions.map((question) => question.answer) // the answer in essay form

  const wrongAnswers = getWrongAnswers(exam.type, correctAnswers, answers)

  console.log(wrongAnswers)

  const userScore =
    ((correctAnswers.length - wrongAnswers.length) / correctAnswers.length) *
    100

  // update the schema with that information
  exam.students.push({
    student: req.user.id,
    answers: answers,
    score: userScore
  })
  await exam.save()

  res.render('exam_results', {
    title: 'Exam Result',
    wrongAnswers,
    exam,
    score: userScore
  })
})
