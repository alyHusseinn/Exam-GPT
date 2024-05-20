const mongoose = require('mongoose')
const generateQuestions = require('../Ai/openai')

const Schema = mongoose.Schema

const examSchema = new Schema({
  topic: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['essay', 'mcq', 'oral'],
    required: true
  },
  numberOfQuestions: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: [2, 'Time must be at least 10 minutes'],
    max: [60, 'Time must be at most 60 minutes'],
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submitions: {
    type: [Schema.Types.ObjectId],
    ref: 'Submition'
  },
  essayQuestions: [
    {
      question: String,
      answer: String
    }
  ],
  mcqQuestions: [
    {
      question: String,
      choices: [String],
      answer: Number
    }
  ]
})

examSchema.virtual('url').get(function () {
  return `/exam/${this._id}`
})

// generate the exam questions before saving.
examSchema.pre('save', async function (next) {
  try {
    if (this.type === 'mcq') {
      const generatedQuestions = await generateQuestions(
        this.topic,
        this.numberOfQuestions,
        true
      )
      if (generatedQuestions && generatedQuestions.questions) {
        this.mcqQuestions = generatedQuestions.questions
      } else {
        throw new Error('No MCQ questions generated')
      }
    } else {
      const generatedQuestions = await generateQuestions(
        this.topic,
        this.numberOfQuestions,
        false
      )
      if (generatedQuestions && generatedQuestions.questions) {
        this.essayQuestions = generatedQuestions.questions
      } else {
        throw new Error('No essay questions generated')
      }
    }
    next()
  } catch (error) {
    console.error('Error generating questions:', error)
    next(error) // Pass the error to the next middleware or to Mongoose
  }
})

module.exports = mongoose.model('Exam', examSchema)
