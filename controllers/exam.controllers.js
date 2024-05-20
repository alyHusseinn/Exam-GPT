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
    .isInt({ min: 1, max: 40 })
    .withMessage('Number of questions must be between 1 and 40'),
  body('type')
    .isIn(['mcq', 'essay', 'oral'])
    .withMessage("Type must be either 'mcq', 'essay' or 'oral'"),
  body('duration')
    .isNumeric()
    .withMessage('Duration must be a number')
    .isInt({ min: 2, max: 60 })
    .withMessage('Duration must be between 5 and 60 minutes'),

    
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.render('home', {
        title: 'Exam Form',
        errors: errors.array()
      })
    } else {
      const { topic, type, questions_number, duration } = req.body
      const exam = new Exam({
        topic,
        type,
        duration,
        numberOfQuestions: questions_number,
        teacher: req.user.id // get from the cookie middlewared
      })
      try {
        const newExam = await exam.save()
        res.redirect(newExam.url)
      } catch (err) {
        console.log(err)
        res.render('home', {
          title: 'Exam Form',
          errors: [
            { msg: 'Error while creating exam from OpenAi please try again' }
          ]
        })
      }
    }
  })
]

// when get the exam add a new empty submition with that user and the data of starting the exam
// in order to compare the calc the time taken by the user to complete the exam
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

    // create a empty submition just to indicate that the student has recieved the exam
    const submition = new Submition({
      exam: exam._id,
      student: req.user.id,
      startTime: Date.now()
    })

    await submition.save()

    res.render(exam.type == 'oral' ? 'exam_oral_form' : 'exam_form', {
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
  const submition = await Submition.findOne({
    exam: exam._id,
    student: req.user.id
  })
  if (submition.answers) {
    return res.redirect(exam.url)
  }

  // const answers = Object.values(req.body)

  // update the schema with that information
  const updatedSubmition = new Submition({
    _id: submition._id,
    exam: req.params.id,
    student: req.user.id,
    startTime: submition.startTime,
    endTime: Date.now(),
    answers: req.body
  })

  try {
    const newSubmition = await Submition.findByIdAndUpdate(
      submition._id,
      updatedSubmition
    )
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
    await Submition.deleteMany({ exam: req.params.id })
    res.redirect(req.user.url)
  } catch (err) {
    console.log(err)
  }
})