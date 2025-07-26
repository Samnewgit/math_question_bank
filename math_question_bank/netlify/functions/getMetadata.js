const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    try {
        // Path to metadata file
        const filePath = path.join(__dirname, '../../data/metadata.json');
        
        if (!fs.existsSync(filePath)) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Metadata file not found' })
            };
        }
        
        const data = fs.readFileSync(filePath, 'utf8');
        const metadata = JSON.parse(data);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(metadata)
        };
    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error', details: error.message })
        };
    }
};
