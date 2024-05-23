const Exam = require('../models/exam')
const Submition = require('../models/submition')
const asyncHandler = require('express-async-handler')
// const { body, validationResult } = require('express-validator')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const fs = require('fs')
const ObjectId = require('mongoose').Types.ObjectId
const { body, validationResult } = require('express-validator')

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
  upload.array('voices'),
  asyncHandler(async (req, res, next) => {
    const exam = await Exam.findById(req.params.id)
    console.log(req.body)
    const submition = await Submition.findOne({
      exam: req.params.id,
      student: req.user.id
    })

    if (!exam) {
      const error = new Error('Exam not found')
      error.status = 404
      return next(error)
    }

    if (submition && submition.answers && submition.answers.length > 0) {
      return res.redirect('/oral-exam/' + req.params.id)
    }
    try {
      // Upload voice recordings to Cloudinary and get the URLs
      const voiceIndexes =
        req.body.voiceIndexes.length > 1
          ? req.body.voiceIndexes
          : [req.body.voiceIndexes]
      const tempUrl =
        'https://us-tuna-sounds-files.voicemod.net/1b25f6c5-45a8-4124-b0fc-2cd6585d08fe-1690339881517.mp3'
      const uploadPromises = req.files.map(async (file) => {
        try {
          const response = await cloudinary.uploader.upload(file.path, {
            resource_type: 'video'
          })
          return response.url
        } catch (err) {
          console.error('Error uploading file to Cloudinary:', err)
          return tempUrl // Placeholder for failed uploads
        } finally {
          // Clean up temporary files
          fs.unlinkSync(file.path)
        }
      })

      let urls = await Promise.all(uploadPromises)
      // Create a new answers array with the correct index mapping
      const answers = Array(exam.numberOfQuestions).fill(tempUrl)
      voiceIndexes.forEach((index, i) => {
        answers[index] = urls[i]
      })

      const updatedSubmition = {
        _id: submition._id,
        answers,
        endTime: Date.now()
      }

      await Submition.findByIdAndUpdate(submition._id, updatedSubmition)
      res.status(200).send('Success')
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
exports.oralExamSubmitCorrection_post = [
  body('degree').isNumeric().withMessage('Degree must be a number'),
  asyncHandler(async (req, res, next) => {
    // we got in body an array of 'true' and 'false' values
    // we shuold update the submition with the wrong answers and add his score
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed')
      error.statusCode = 422
      error.data = errors.array()
      return next(error)
    }
    const submition = await Submition.findById(req.params.id).populate('exam')
    const degree = req.body.degree
    // delete the degree from the body object
    // delete req.body.degree
    // const examCorrection = Object.values(req.body)
    const wrongAnswers = []

    // examCorrection.forEach((answer, index) => {
    //   if (answer === 'false') {
    //     wrongAnswers.push(index)
    //   }
    // })
    // if body.degree > submition.exam.degree but the score as the whole degree
    const score =
      degree > submition.exam.degree ? submition.exam.degree : degree

    const update = new Submition({
      _id: req.params.id,
      exam: submition.exam._id,
      student: submition.student,
      answers: submition.answers,
      wrongAnswers,
      score
    })
    try {
      await Submition.findByIdAndUpdate(req.params.id, update)
    } catch (err) {
      console.log(err)
    }
    res.redirect(submition.url)
  })
]
