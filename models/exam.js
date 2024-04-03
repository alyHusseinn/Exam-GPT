const mongoose = require("mongoose");
const generateQuestions = require("../Ai/openai");

const Schema = mongoose.Schema;

const examSchema = new Schema({
  topic: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["essay", "mcq"],
    required: true,
  },
  numberOfQuestions: {
    type: Number,
    required: true,
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  students: [
    {
      student: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      score: {
        type: Number,
      },
    },
  ],
  essayQuestions: [
    {
      question: {
        type: String,
      },
      answer: {
        type: String,
      },
    },
  ],
  mcqQuestions: [
    {
      question: {
        type: String,
      },
      choices: [
        {
          type: String,
        },
      ],
      answer: {
        type: Number,
      },
    },
  ],
});

examSchema.virtual("url").get(function () {
  return `/exams/${this._id}`;
});

// generate the exam questions before saving.
examSchema.pre("save", async function () {
  this.type === "mcq"
    ? (this.mcqQuestions = await generateQuestions( this.topic, this.numberOfQuestions, true ))
    : (this.essayQuestions = await generateQuestions( this.topic, this.numberOfQuestions, false));
});

module.exports = mongoose.model("Exam", examSchema);
