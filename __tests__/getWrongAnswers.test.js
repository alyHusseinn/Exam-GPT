const getWrongAnswers = require("../Ai/getWrongAnswers");

describe("get the worng answers of MCQ questions", () => {
  test("get the wrong answers of MCQ questions", () => {
    expect(getWrongAnswers("mcq", [2, 2, 1, 0], [2, 2, 1, 2])).toEqual([3]);
    expect(getWrongAnswers("mcq", [2, 2, 1, 0], [1, 1, 1, 2])).toEqual([
      0, 1, 3,
    ]);
    expect(getWrongAnswers("mcq", [2, 2, 1, 0], [2, 2, 1, 0])).toEqual([]);
  });
});

describe("get the worng answers of Essay questions", () => {
  test("get the wrong answers of Essay questions", () => {
    expect(
      // test non identical answers
      getWrongAnswers(
        "essay",
        [
          "Artificial intelligence is a field of study that encompasses the creation of intelligent machines. It differs from human intelligence in that it is not limited to the capabilities of humans.",
          "Start by creating a new file in the project folder and naming it calculator.test.js. The file will have the following content:",
        ],
        [
          "Artificial intelligence is a field of study that encompasses the creation of intelligent machines. It differs from human intelligence in that it is not limited to the capabilities of humans.",
          "As you can see, the test itself is a simple function, that gets two parameters:",
        ]
      )
    ).toEqual([1]);
    expect(
      // test identical answers
      getWrongAnswers(
        "essay",
        [
          "Artificial intelligence is a field of study that encompasses the creation of intelligent machines. It differs from human intelligence in that it is not limited to the capabilities of humans.",
          "Start by creating a new file in the project folder and naming it calculator.test.js. The file will have the following content:",
        ],
        [
          "Artificial intelligence is a field of study that encompasses the creation of intelligent machines. It differs from human intelligence in that it is not limited to the capabilities of humans.",
          "Start by creating a new file in the project folder and naming it calculator.test.js. The file will have the following content:",
        ]
      )
    ).toEqual([]);
  });
});
