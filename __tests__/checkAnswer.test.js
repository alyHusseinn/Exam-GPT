const checkAnswer = require("../Ai/checkAnswer");

test("checkAnswer", () => {
  expect(
    checkAnswer(
      "Artificial intelligence is a field of study that encompasses the creation of intelligent machines. It differs from human intelligence in that it is not limited to the capabilities of humans.",
      "Artificial intelligence encompasses developing algorithms and systems that can perform tasks typically requiring human intelligence, such as problem-solving, learning, and decision-making. It differs from human intelligence in terms of its ability to process large amounts of data quickly, learn from patterns, and make decisions based on algorithms and logic rather than emotional or intuitive reasoning."
    )
  ).toBe(false);

  expect(
    checkAnswer(
      "Artificial intelligence is a field of study that encompasses the creation of intelligent machines. It differs from human intelligence in that it is not limited to the capabilities of humans.",
      "Artificial intelligence is a field of study that encompasses the creation of intelligent machines. It differs from human intelligence in that it is not limited to the capabilities of humans."
    )
  ).toBe(true);
});

// const answer1 = "Artificial intelligence is a field of study that encompasses the creation of intelligent machines. It differs from human intelligence in that it is not limited to the capabilities of humans.";
// const answer2 = "Artificial intelligence encompasses developing algorithms and systems that can perform tasks typically requiring human intelligence, such as problem-solving, learning, and decision-making. It differs from human intelligence in terms of its ability to process large amounts of data quickly, learn from patterns, and make decisions based on algorithms and logic rather than emotional or intuitive reasoning.";
