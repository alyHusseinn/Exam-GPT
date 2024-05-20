const checkAnswer = require("./checkAnswer");
// function takes the right answers and the user answers and returns
// all the indecies of the wrong answers for assay questions
function getWrongAnswerIndecesForEssay(rightAnswers, userAnswers) {
  const wrongAnswerIndeces = [];
  for (let i = 0; i < rightAnswers.length; i++) {
    if (!userAnswers || !userAnswers[i] || !checkAnswer(userAnswers[i], rightAnswers[i])) {
      wrongAnswerIndeces.push(i);
    }
  }
  return wrongAnswerIndeces;
}
// function takes the right answers and the user answers and returns
// all the indecies of the wrong answers for mcq questions
function getWrongAnswerIndecesForMcq(rightAnswers, userAnswers) {
  const wrongAnswerIndeces = [];
  for (let i = 0; i < rightAnswers.length; i++) {
    if (!userAnswers || !userAnswers[i] || userAnswers[i] != rightAnswers[i]) {
      wrongAnswerIndeces.push(i);
    }
  }
  return wrongAnswerIndeces;
}

function getWrongAnswers(type, rightAnswers, userAnswers) {
  if (type === "mcq") {
    return getWrongAnswerIndecesForMcq(rightAnswers, userAnswers);
  } else {
    return getWrongAnswerIndecesForEssay(rightAnswers, userAnswers);
  }
}

module.exports = getWrongAnswers;