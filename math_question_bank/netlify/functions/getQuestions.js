const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  const chapter = event.queryStringParameters.chapter;

  if (!chapter) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Chapter parameter is required.' }) };
  }

  const safeChapter = path.normalize(chapter).replace(/^(\.\.[\/\\])+/, '');
  
  // This path logic is now correct for your file structure.
  // __dirname is ".../netlify/functions"
  // '..' goes up to ".../netlify"
  // '..' again goes up to the project root ".../math_question_bank/"
  // From there, it correctly finds the 'data' folder.
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
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: `Questions file not found for chapter: ${safeChapter}`,
        }),
      };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error processing request.' }) };
  }
};
