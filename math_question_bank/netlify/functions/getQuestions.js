const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    try {
        // Get the chapter parameter from query string
        const { chapter } = event.queryStringParameters || {};
        
        // Validate chapter parameter
        if (!chapter) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Chapter parameter is required' })
            };
        }
        
        // Sanitize chapter input to prevent directory traversal
        const sanitizedChapter = chapter.replace(/[^a-z0-9]/gi, '').toLowerCase();
        
        // Construct file path
        const filePath = path.join(__dirname, '../../data/questions', `${sanitizedChapter}_all.json`);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return {
                statusCode: 404,
                body: JSON.stringify([])
            };
        }
        
        // Read and return the file content
        const data = fs.readFileSync(filePath, 'utf8');
        const questions = JSON.parse(data);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Enable CORS
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