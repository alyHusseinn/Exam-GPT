const mongoose = require('mongoose');
const generateQuestions = require('../openai');

const Schema = mongoose.Schema;

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
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    essayQuestions: [{
        question: {
            type: String,
        },
        answer: {
            type: String
        }
    }],
    mcqQuestions: [{
        question: {
            type: String
        },
        choices: [{
            type: String
        }],
        answer: {
            type: Number
        }
    }]
});

examSchema.get('url', function() {
    return `/exams/${this._id}`;
});

// generate the exam questions before saving.
examSchema.pre('save', async function() {
    if (this.type === 'mcq') {
        this.mcqQuestions = await generateQuestions(this.topic, this.numberOfQuestions, true);
    } else {
        this.essayQuestions = await generateQuestions(this.topic, this.numberOfQuestions, false);
    }
})

module.exports = mongoose.model('Exam', examSchema);