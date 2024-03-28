const OpenAI = require("openai").OpenAI;
require('dotenv').config();
//const { OPENAI_API_KEY } = require("./config/env");
// Instantiate the OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateQuestions = async (topic, numOfQuestions, isMcq) => {
  const promptNormalQuestions = `Generate ${numOfQuestions} questions about ${topic} in this JSON format: 
  {
    questions: [
      {question: 'question', answer: 'answer'},
      {question: 'question', answer: 'answer'},
    ]
  }`;

  const promptMcqQuestions = `Generate ${numOfQuestions} MCQ questions about ${topic} in this JSON format:
  {
    questions: [
      {question: 'question', choices: ['choice1', 'choice2', 'choice3'], answer: 0},
      {question: 'question', choices: ['choice1', 'choice2', 'choice3'], answer: 2},
    ]
  }`;

  const questions = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // Specify the model to use
    messages: [
      {
        role: "user",
        content: isMcq ? promptMcqQuestions : promptNormalQuestions,
      },
    ],
    max_tokens: 1000, // Maximum length of the generated completion
  });

  return JSON.parse(questions.choices[0].message.content);
};

module.exports = generateQuestions;