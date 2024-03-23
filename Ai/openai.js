const OpenAI = require("openai").OpenAI;
require("dotenv").config();
// Instantiate the OpenAI API client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  
  return questions.choices[0].message.content;
};

//generateQuestions("artificial intelligence", 1, true).then(res => console.log(res));

// const checkAnswer = async (question, answer) => {
//   // Define the parameters for the completion request
//   openai.chat.completions
//     .create({
//       model: "gpt-3.5-turbo", // Specify the model to use
//       messages: [
//         {
//           role: "user",
//           content: `Check if ${answer} is correct in ${question}`,
//         },
//       ],
//       max_tokens: 1000, // Maximum length of the generated completion
//       //   max_tokens: 1000, // Maximum length of the generated completion
//       //   temperature: 1, // Temperature of the generated completion
//     })
//     .then((response) => console.log(response.choices[0].message.content))
//     .catch((err) => console.log(err));
// };

// checkAnswer(
//   "What is artificial intelligence and how does it differ from human intelligence?",
//   "Artificial intelligence is a field of study that encompasses the creation of intelligent machines. It differs from human intelligence in that it is not limited to the capabilities of humans."
// );
