const mongoose = require('mongoose')
const Exam = require('./exam')
const getWrongAnswers = require('../Ai/getWrongAnswers')
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

const Schema = mongoose.Schema

const submitionSchema = new Schema({
  exam: {
    type: Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
  },
  answers: {
    type: {},
    // required: true
  },
  wrongAnswers: {
    type: [Number]
  },
  score: {
    type: Number,
    default: null
  }
})

submitionSchema.virtual('url').get(function () {
  return `/submition/${this._id}`
})

submitionSchema.pre('findOneAndUpdate', async function(next) {
  const query = this.getQuery();
  const update = this.getUpdate();

  try {
    // Find the document being updated
    const submition = await this.model.findOne(query);

    if (!submition) {
      return next(new Error('Submission not found'));
    }

    // Find the associated exam
    const exam = await Exam.findById(submition.exam);

    if (!exam) {
      return next(new Error('Exam not found'));
    }

    if (exam.type === 'oral') {
      return next();
    }

    // Calculate the right and wrong answers
    const rightAnswers = exam.type === 'mcq'
      ? exam.mcqQuestions.map(question => question.answer)
      : exam.essayQuestions.map(question => question.answer);

    const wrongAnswers = getWrongAnswers(exam.type, rightAnswers, update.answers || submition.answers);
    const score = ((rightAnswers.length - wrongAnswers.length) / rightAnswers.length) * 100;

    // Set the calculated fields in the update data
    update.wrongAnswers = wrongAnswers;
    update.score = score;

    this.setUpdate(update);

    next(); // Call next to proceed with the update operation
  } catch (error) {
    next(error); // Pass any errors to the next middleware
  }
});

submitionSchema.pre('remove', async function (next) {
  // remove the audios from cloudinary
  try {
    const urls = this.answers
    await cloudinary.api.delete_resources(urls, {
      resource_type: 'video'
    })

    next()
  } catch (error) {
    console.log('Error While removing audios from cloudinary', error)
    next(error)
  }
})

module.exports = mongoose.model('Submition', submitionSchema)
