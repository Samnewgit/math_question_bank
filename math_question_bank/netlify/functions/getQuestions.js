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
        const filename = `${sanitizedChapter}_all.json`;
        
        // With included_files, data should be available at this path
        const filePath = path.join(__dirname, '../../data/questions', filename);
        
        // Log the exact path for debugging
        console.log('Looking for file at:', filePath);
        console.log('File exists:', fs.existsSync(filePath));
        
        if (!fs.existsSync(filePath)) {
            return {
                statusCode: 404,
                body: JSON.stringify({ 
                    error: `Questions file not found for chapter: ${chapter}`,
                    lookedIn: filePath
                })
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
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error', details: error.message })
        };
    }
};
