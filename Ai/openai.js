const OpenAI = require('openai').OpenAI
require('dotenv').config()
//const { OPENAI_API_KEY } = require("./config/env");
// Instantiate the OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const generateQuestions = async (topic, numOfQuestions, isMcq) => {
  const promptNormalQuestions = `Generate ${numOfQuestions} questions about ${topic} in this JSON format and check that it is valid when Parse it with JSON.parse(): 
  {
    questions: [
      {
        question: 'question', 
        answer: 'answer'
      },
      {
        question: 'question', 
        answer: 'answer'
      }
    ]
  }`

  const promptMcqQuestions = `Generate ${numOfQuestions} MCQ questions about ${topic} in this right JSON format and check that it is valid when Parse it with JSON.parse():
  {
    questions: [
      {
        question: 'question', 
        choices: ['choice1', 'choice2', 'choice3'], 
        answer: 0
      },
      {
        question: 'question', 
        choices: ['choice1', 'choice2', 'choice3'], 
        answer: 2
      }
    ]
  }`
  try {
    const questions = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Specify the model to use
      messages: [
        {
          role: 'user',
          content: isMcq ? promptMcqQuestions : promptNormalQuestions
        }
      ],
      //max_tokens: 1000 // Maximum length of the generated completion
    })
    // Check if choices array exists and is not empty
    if (questions.choices && questions.choices.length > 0) {
      const parsedContent = JSON.parse(questions.choices[0].message.content)
      return parsedContent
    } else {
      throw new Error('Invalid response from OpenAI API')
    }
  } catch (error) {
    console.error('Error generating questions:', error)
    throw new Error('Error generating questions');
    return null
  }
}

module.exports = generateQuestions
