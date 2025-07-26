// netlify/functions/getQuestions.js

const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  const chapter = event.queryStringParameters.chapter;

  if (!chapter) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Chapter parameter is required.' }) };
  }

  const safeChapter = path.normalize(chapter).replace(/^(\.\.[\/\\])+/, '');
  
  // This uses the same, simple, robust pathing logic.
  const filePath = path.join(__dirname, '..', 'data', 'questions', `${safeChapter}_all.json`);

  try {
    if (fs.existsSync(filePath)) {
      const questionData = fs.readFileSync(filePath, 'utf-8');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: questionData,
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `Questions file not found for chapter: ${safeChapter}` }),
      };
    }
  } catch (error) {
    console.error('CRITICAL ERROR in getQuestions:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error.' }) };
  }
};
