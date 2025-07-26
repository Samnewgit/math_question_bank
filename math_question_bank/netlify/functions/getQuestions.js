// netlify/functions/getQuestions.js

const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  const chapter = event.queryStringParameters.chapter;

  if (!chapter) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Chapter parameter is required.' }) };
  }

  // Sanitize the input for security
  const safeChapter = path.normalize(chapter).replace(/^(\.\.[\/\\])+/, '');
  
  // --- THE CRITICAL FIX IS HERE ---
  // Construct the path relative to the CURRENT function file's directory (__dirname)
  // This reliably finds the 'data' folder that Netlify packaged with the function.
  const filePath = path.join(__dirname, '..', '..', 'data', 'questions', `${safeChapter}_all.json`);

  try {
    if (fs.existsSync(filePath)) {
      const questionData = fs.readFileSync(filePath, 'utf-8');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: questionData,
      };
    } else {
      // If the file doesn't exist, return our custom error for easier debugging
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: `Questions file not found for chapter: ${safeChapter}`,
          lookedFor: `${safeChapter}_all.json`,
          lookedInPath: filePath // This will show us the full path it tried
        }),
      };
    }
  } catch (error) {
    console.error('Server error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error processing request.' }) };
  }
};
