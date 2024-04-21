const Exam = require('../models/exam')
const Submition = require('../models/submition')
const asyncHandler = require('express-async-handler')
// const { body, validationResult } = require('express-validator')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const fs = require('fs')
const ObjectId = require('mongoose').Types.ObjectId

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
  const submitions = await Submition.aggregate([
    {
      $lookup: {
        from: 'exams',
        localField: 'exam',
        foreignField: '_id',
        as: 'exam'
      }
    },
    {
      $unwind: '$exam' // Unwind the exam array to get individual objects
    },
    {
      $lookup: {
        from: 'users',
        localField: 'student',
        foreignField: '_id',
        as: 'student'
      }
    },
    {
      $unwind: '$student' // Unwind the student array to get individual objects
    },
    {
      $match: {
        'exam.teacher': new ObjectId(req.user.id), // Assuming req.user.id contains the teacher's ID
        'exam.type': 'oral',
        score: null
      }
    }
  ]).exec()

  res.render('oral_exams_list', {
    title: 'Oral Exam List',
    submitions
  })
})

// oral exam corrections form the teacher

exports.oralExamCorrection_form_get = asyncHandler(async (req, res, next) => {
  const submition = await Submition.findById(req.params.id)
    .populate('exam student')
    .exec()

  res.render('oral_exam_correction_form', {
    title: 'Oral Exam Correction Form',
    submition
  })
})

// POST: oral exam corrections
exports.oralExamSubmitCorrection_post = asyncHandler(async (req, res, next) => {
  // we got in body an array of 'true' and 'false' values
  // we shuold update the submition with the wrong answers and add his score
  const submition = await Submition.findById(req.params.id)
  const examCorrection = Object.values(req.body)
  const WrongAnswers = []

  examCorrection.forEach((answer, index) => {
    if (answer === 'false') {
      WrongAnswers.push(index)
    }
  })

  const score =
    ((examCorrection.length - WrongAnswers.length) / examCorrection.length) * 100

  const update = new Submition({
    _id: req.params.id,
    exam: submition.exam,
    student: submition.student,
    answers: submition.answers,
    wrongAnswers: WrongAnswers,
    score
  })
  try {
    await Submition.findByIdAndUpdate(req.params.id, update)
  } catch (err) {
    console.log(err)
  }
  res.redirect(submition.url);
})
