const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    try {
        const { chapter } = event.queryStringParameters || {};
        
        if (!chapter) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Chapter parameter is required' })
            };
        }
        
        const sanitizedChapter = chapter.replace(/[^a-z0-9]/gi, '').toLowerCase();
        
        // Always use root data folder for Netlify functions
        const filePath = path.join(process.cwd(), '..', 'data', 'questions', `${sanitizedChapter}_all.json`);
        
        if (!fs.existsSync(filePath)) {
            return {
                statusCode: 404,
                body: JSON.stringify([])
            };
        }
        
        const data = fs.readFileSync(filePath, 'utf8');
        const questions = JSON.parse(data);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(questions)
        };
    } catch (error) {
        console.error('Error in getQuestions function:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
