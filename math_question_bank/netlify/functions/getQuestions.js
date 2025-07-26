const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    try {
        console.log('=== FILE LOCATION DEBUG ===');
        console.log('Function directory:', __dirname);
        console.log('Current working directory:', process.cwd());
        
        // List contents of current directory
        try {
            console.log('Current directory contents:', fs.readdirSync('.'));
        } catch (e) {
            console.log('Could not read current directory:', e.message);
        }
        
        // List contents of parent directories
        try {
            console.log('Parent directory contents:', fs.readdirSync('..'));
        } catch (e) {
            console.log('Could not read parent directory:', e.message);
        }
        
        try {
            console.log('Parent of parent directory contents:', fs.readdirSync('../..'));
        } catch (e) {
            console.log('Could not read parent of parent directory:', e.message);
        }
        
        const { chapter } = event.queryStringParameters || {};
        
        if (!chapter) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Chapter parameter is required' })
            };
        }
        
        const sanitizedChapter = chapter.replace(/[^a-z0-9]/gi, '').toLowerCase();
        const filename = `${sanitizedChapter}_all.json`;
        
        console.log(`Looking for chapter: ${sanitizedChapter}`);
        console.log(`Filename: ${filename}`);
        
        // Try multiple paths in order of likelihood
        const searchPaths = [
            path.join(__dirname, '../../data/questions', filename),  // Most likely
            path.join(process.cwd(), 'data/questions', filename),    // Alternative
            path.join(__dirname, '../../../data/questions', filename), // If nested deeper
            `./data/questions/${filename}`,                          // Relative from cwd
            `../data/questions/${filename}`,                         // One level up
            `../../data/questions/${filename}`,                      // Two levels up
            `/var/task/data/questions/${filename}`,                  // Absolute path
        ];
        
        let filePath = null;
        let fileData = null;
        
        console.log('Searching in the following paths:');
        for (let i = 0; i < searchPaths.length; i++) {
            const searchPath = searchPaths[i];
            try {
                console.log(`  ${i + 1}. Checking: ${searchPath}`);
                if (fs.existsSync(searchPath)) {
                    console.log(`     FOUND! Reading file...`);
                    fileData = fs.readFileSync(searchPath, 'utf8');
                    filePath = searchPath;
                    console.log(`     File size: ${fileData.length} characters`);
                    break;
                } else {
                    console.log(`     NOT FOUND`);
                }
            } catch (e) {
                console.log(`     ERROR: ${e.message}`);
            }
        }
        
        if (!fileData) {
            console.log('=== FILE NOT FOUND IN ANY LOCATION ===');
            return {
                statusCode: 404,
                body: JSON.stringify({ 
                    error: `Questions file not found for chapter: ${chapter}`,
                    searchedPaths: searchPaths
                })
            };
        }
        
        console.log('Parsing JSON data...');
        const questions = JSON.parse(fileData);
        console.log(`Successfully parsed ${questions.length} questions`);
        
        console.log('=== SUCCESS ===');
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(questions)
        };
    } catch (error) {
        console.error('=== FUNCTION ERROR ===', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Internal server error', 
                details: error.message,
                stack: error.stack
            })
        };
    }
};
