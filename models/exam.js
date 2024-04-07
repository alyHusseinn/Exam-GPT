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
    enum: ['essay', 'mcq'],
    required: true
  },
  numberOfQuestions: {
    type: Number,
    required: true
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
      question: {
        type: String
      },
      answer: {
        type: String
      }
    }
  ],
  mcqQuestions: [
    {
      question: {
        type: String
      },
      choices: [
        {
          type: String
        }
      ],
      answer: {
        type: Number
      }
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
        console.log(this.mcqQuestions)
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
        console.log(this.essayQuestions)
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
