const Exam = require('../models/exam')
const Submition = require('../models/submition')
const asyncHandler = require('express-async-handler')
// const { body, validationResult } = require('express-validator')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const fs = require('fs')

const upload = multer({ dest: 'uploads/' }) // Set destination folder if needed

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

// Handle submission of oral exam by student
exports.oralExamSubmit = [
  upload.array('voice'),
  asyncHandler(async (req, res, next) => {
    try {
      // Upload voice recordings to Cloudinary and get the URLs
      const uploadPromises = req.files.map(async (file) => {
        try {
          const response = await cloudinary.uploader.upload(file.path, {
            resource_type: 'video'
          })
          return response.url
        } catch (err) {
          console.error('Error uploading file to Cloudinary:', err)
          return null // Placeholder for failed uploads
        } finally {
          // Clean up temporary files
          fs.unlinkSync(file.path)
        }
      })

      const urls = await Promise.all(uploadPromises)

      // Create a new submission if all uploads were successful
      if (urls.every((url) => url !== null)) {
        const submition = new Submition({
          exam: req.params.id,
          student: req.user.id,
          answers: urls
        })
        await submition.save()
        res.status(200).send('Success')
      } else {
        // Send error response if any upload failed
        res.status(500).send('Error uploading files to Cloudinary')
      }
    } catch (err) {
      console.error('Error processing submission:', err)
      res.status(500).send('Error processing submission')
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

exports.oralExamCorrection_form_get = asyncHandler(async (req, res, next) => {
  const submission = await Submition.findById(req.params.id)
    .populate('exam student')
    .exec()

  res.render('oral_exam_correction_form', {
    title: 'Oral Exam Correction Form',
    submission
  })
})

// POST: oral exam corrections
exports.oralExamSubmitCorrection_post = asyncHandler(async (req, res, next) => {
  const submition = await Submition.findById(req.params.id)
  submition.score = req.body.score
  submition.wrongAnswers = req.body.wrongAnswers
  await submition.save()
})
