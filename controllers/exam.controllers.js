const Exam = require('../models/exam')
const Submition = require('../models/submition')
const asyncHandler = require('express-async-handler')
const { body, validationResult } = require('express-validator')

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
    const submition = await Submition.findOne({
      exam: exam._id,
      student: req.user.id
    })

    let availableTime =
      `${exam.duration < 10 ? '0' : ''}${exam.duration}` + ':00'

    // Check if the user has already submitted the exam or exceeded the time limit
    if (submition) {
      const currentTime = Date.now()
      const examStartTime = new Date(submition.startTime).getTime()
      const examDuration = exam.duration * 60 * 1000 // Convert exam duration to milliseconds

      // Calculate the available time in the format mm:ss
      const elapsedTime = currentTime - examStartTime
      const reminingTime = examDuration - elapsedTime
      const minutes = Math.floor(
        (reminingTime % (1000 * 60 * 60)) / (1000 * 60)
      )
      const seconds = Math.floor((reminingTime % (1000 * 60)) / 1000)
      availableTime = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

      console.log(`Available Time: ${availableTime}`) // Log the available time
      // when the user exceeds the time limit and did not submit the answers
      if (reminingTime <= 0 && !submition.answers) {
        console.log('You have exceeded the time limit. Please try again later.')
        return res.redirect('/home')
      }
      if (reminingTime <= 0 || submition.answers) {
        return res.redirect(submition.url)
      }
    } else {
      const newSubmition = new Submition({
        exam: exam._id,
        student: req.user.id,
        startTime: Date.now()
      })
      await newSubmition.save()
    }

    res.render(exam.type == 'oral' ? 'exam_oral_form' : 'exam_form', {
      title: 'exam form',
      exam: exam,
      availableTime
    })
  } else {
    // show submitions that has answers and didn't exceed the time limit
    const examSubmitions = await Submition.find({
      exam: exam._id,
      answers: { $ne: null }
    })
      .select('-answers -wrongAnswers')
      .populate('student', '-password')
      .exec()

    // examSubmitions.sort((a, b) => b.startTime - a.startTime)
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

  // update the schema with that information
  const updatedSubmition = {
    _id: submition._id,
    endTime: Date.now(),
    answers: req.body
  }

  try {
    const newSubmition = await Submition.findByIdAndUpdate(
      submition._id,
      updatedSubmition,
      { new: true }
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
    submition.exam.teacher.toString() !== req.user.id.toString() &&
    req.user.role !== 'admin'
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
  if (
    exam.teacher.toString() != req.user.id.toString() &&
    req.user.role !== 'admin'
  ) {
    const error = new Error('You are not authorized to delete this exam')
    error.status = 401
    return next(error)
  }
  try {
    const examSubmitions = await Submition.find({ exam: req.params.id })

    await Promise.all(
      examSubmitions.map(async (submition) => {
        await cloudinary.api.delete_resources(submition.answers, {
          resource_type: 'video'
        })
        await Submition.findByIdAndDelete(submition._id)
      })
    )
    await Exam.findByIdAndDelete(req.params.id)
    // delete all that exam submitions
    res.redirect(req.user.url)
  } catch (err) {
    console.log(err)
  }
})