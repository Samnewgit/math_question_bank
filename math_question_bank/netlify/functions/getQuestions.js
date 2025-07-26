const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    try {
        console.log('=== Function Debug Info ===');
        console.log('Current working directory:', process.cwd());
        console.log('Function directory:', __dirname);
        console.log('Event:', JSON.stringify(event, null, 2));
        
        const { chapter } = event.queryStringParameters || {};
        
        if (!chapter) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Chapter parameter is required' })
            };
        }
        
        console.log('Requested chapter:', chapter);
        
        const sanitizedChapter = chapter.replace(/[^a-z0-9]/gi, '').toLowerCase();
        console.log('Sanitized chapter:', sanitizedChapter);
        
        // Try multiple possible paths
        const possiblePaths = [
            path.join(__dirname, '../../data/questions', `${sanitizedChapter}_all.json`),
            path.join(process.cwd(), 'data/questions', `${sanitizedChapter}_all.json`),
            path.join(process.cwd(), '../data/questions', `${sanitizedChapter}_all.json`),
            path.join(__dirname, '../../../data/questions', `${sanitizedChapter}_all.json`)
        ];
        
        let filePath = null;
        console.log('Trying possible paths:');
        
        for (let i = 0; i < possiblePaths.length; i++) {
            const possiblePath = possiblePaths[i];
            const exists = fs.existsSync(possiblePath);
            console.log(`  ${i + 1}. ${possiblePath} - ${exists ? 'FOUND' : 'NOT FOUND'}`);
            
            if (exists) {
                filePath = possiblePath;
                break;
            }
        }
        
        if (!filePath) {
            console.log('No valid file path found!');
            // List files in the data directory for debugging
            try {
                const dataDir = path.join(__dirname, '../../data/questions');
                console.log('Contents of data/questions directory:');
                console.log(fs.readdirSync(dataDir));
            } catch (dirError) {
                console.log('Could not read data directory:', dirError.message);
            }
            
            return {
                statusCode: 404,
                body: JSON.stringify({ error: `Questions file not found for chapter: ${chapter}` })
            };
        }
        
        console.log('Using file path:', filePath);
        
        const data = fs.readFileSync(filePath, 'utf8');
        const questions = JSON.parse(data);
        
        console.log('Returning questions count:', questions.length);
        console.log('=== End Debug Info ===');
        
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
            body: JSON.stringify({ error: 'Internal server error', details: error.message })
        };
    }
};
