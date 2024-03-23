const natural = require('natural');

// Tokenizer and stemmer
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Function to preprocess text
function preprocessText(text) {
    // Tokenize the text
    const tokens = tokenizer.tokenize(text.toLowerCase());
    
    // Remove stopwords and stem tokens
    const filteredTokens = tokens.filter(token => !natural.stopwords.includes(token) && token.match(/^[a-zA-Z]+$/))
                                 .map(token => stemmer.stem(token));
    
    return filteredTokens;
}

// Function to calculate Jaccard similarity
function calculateJaccardSimilarity(text1, text2) {
    // Preprocess both texts
    const tokens1 = preprocessText(text1);
    const tokens2 = preprocessText(text2);
    
    // Calculate Jaccard similarity
    const intersection = new Set(tokens1.filter(token => tokens2.includes(token)));
    const union = new Set([...tokens1, ...tokens2]);
    const similarity = intersection.size / union.size;
    
    return similarity;
}

// Function to check if user's answer matches the correct answer
function checkAnswer(userAnswer, rightAnswer) {
    const similarity = calculateJaccardSimilarity(userAnswer, rightAnswer);
    if(similarity >= 0.4) {
        return true;
    } else {
        return false;
    }
}

export default checkAnswer;

// Example texts
// const answer1 = "Artificial intelligence is a field of study that encompasses the creation of intelligent machines. It differs from human intelligence in that it is not limited to the capabilities of humans.";
// const answer2 = "Artificial intelligence encompasses developing algorithms and systems that can perform tasks typically requiring human intelligence, such as problem-solving, learning, and decision-making. It differs from human intelligence in terms of its ability to process large amounts of data quickly, learn from patterns, and make decisions based on algorithms and logic rather than emotional or intuitive reasoning.";

// Calculate similarity between the two answers
//const similarityScore = calculateJaccardSimilarity(answer1, answer2);
