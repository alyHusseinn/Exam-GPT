const { NlpManager } = require("node-nlp");

// Create a new instance of NLP manager
const manager = new NlpManager({ languages: ["en"] });

// Add the correct answer as a training sample
manager.addDocument("en", "Artificial intelligence is a field of study that encompasses the creation of intelligent machines. It differs from human intelligence in that it is not limited to the capabilities of humans.", "correct");

// Train the model
manager.train();

// Function to check if user's answer matches the correct answer
const checkAnswer = (userAnswer) => {
  // Process the user's answer
  const { classification } = manager.process("en", userAnswer);

  // Check if classification exists and the intent is classified as 'correct'
  return classification && classification.intent === "correct";
};
// Example usage
const userAnswer = "Artificial intelligence encompasses developing algorithms and systems that can perform tasks typically requiring human intelligence, such as problem-solving, learning, and decision-making. It differs from human intelligence in terms of its ability to process large amounts of data quickly, learn from patterns, and make decisions based on algorithms and logic rather than emotional or intuitive reasoning.";
if (checkAnswer(userAnswer)) {
  console.log("Correct!");
} else {
  console.log("Incorrect!");
}
