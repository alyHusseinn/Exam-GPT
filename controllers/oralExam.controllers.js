const Exam = require('../models/exam')
const Submition = require('../models/submition')
const asyncHandler = require('express-async-handler')
const { body, validationResult } = require('express-validator')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const {
  CLOUD_NAME,
  CLOUDINARY_KEY,
  CLOUDINARY_SECRET
} = require('../config/env')

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET
})

// Configure Multer for file upload
const upload = multer()

// Handle submission of oral exam by student
exports.oralExamSubmit = [
  upload.array('records'),
  asyncHandler(async (req, res, next) => {
    try {
      // Upload voice recordings to Cloudinary and get the URLs
      const urls = await Promise.all(
        req.files.map(async (file) => {
          const response = await cloudinary.uploader.upload(file.buffer, {
            resource_type: 'auto'
          })
          return response.url
        })
      )

      // Create a new submission
      const submition = new Submition({
        exam: req.params.id,
        student: req.user.id,
        answers: urls
      })

      // Save the submission to the database
      await submition.save()

      // Send success response
      res.status(200).send('Success')
    } catch (err) {
      console.error(err)
      // Send error response
      res.status(500).send('Error')
    }
  })
]

// get all the oral exams that needs to be corrected by the teacher
exports.oralExamList = asyncHandler(async (req, res, next) => {
  const submitions = await Submition.find({
    'exam.teacher': req.user.id,
    score: { $exists: false }
  })
    .populate('exam', 'topic type numberOfQuestions')
    .populate('student', 'name')
    .exec()

  res.render('oral_exam_list', {
    title: 'Oral Exam List',
    submitions
  })
})

// oral exam corrections form the teacher

exports.oralExamSubmitForm = asyncHandler(async (req, res, next) => {
  const submission = await Submition.findById(req.params.id)
    .populate('exam student')
    .exec();

  res.render('oral_exam_correction_form', {
    title: 'Oral Exam Correction Form',
    submission
  })
});

// POST: oral exam corrections
exports.oralExamSubmitCorrection = asyncHandler(async (req, res, next) => {
  const submition = await Submition.findById(req.params.id)
  submition.score = req.body.score
  submition.wrongAnswers = req.body.wrongAnswers
  await submition.save()
})
