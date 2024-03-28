const Exam = require("../models/exam");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const getWrongAnswers = require("../Ai/getWrongAnswers");

// POST: create exam
exports.exam_create = [
  body("topic")
    .isLength({ min: 5 })
    .withMessage("Topic must be more than 5 characters"),
  body("numberOfQuestions")
    .isLength({ min: 5 })
    .withMessage("Number of questions must be more than 5 characters")
    .isNumeric()
    .withMessage("Number of questions must be a number"),
  body("type")
    .ensure()
    .isIn(["mcq", "essay"])
    .withMessage("Type must be either 'mcq' or 'essay'"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("exam-form-create", {
        title: "Exam Form",
        errors: errors.array(),
      });
    } else {
      const { topic, type, numberOfQuestions } = req.body;
      const exam = new Exam({
        topic,
        type,
        numberOfQuestions,
        teacher: req.user._id, // get from the cookie middlewared
      });
      try {
        await exam.save();
        res.redirect("/exams");
      } catch (err) {
        console.log(err);
      }
    }
  }),
];

exports.exam_get = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id);
  res.render("exam", {
    title: "Exam",
    exam: exam,
  });
});

exports.exam_submit = asyncHandler(async (req, res, next) => {
  // we got the answers from the client
  // check the validity of the answers
  // and then return the exam with the correct answers
  const exam = await Exam.findById(req.params.id);
  const { answers } = req.body;
  const correctAnswers =
    exam.type === "mcq"
      ? exam.mcqQuestions.map((question) => question.answer)
      : exam.essayQuestions.map((question) => question.answer);
  const wrongAnswers = getWrongAnswers(exam.type, correctAnswers, answers);
  res.render("exam", {
    title: "Exam Result",
    wrongAnswers,
    exam,
    score: (wrongAnswers.length / correctAnswers.length) * 100,
  });
});
