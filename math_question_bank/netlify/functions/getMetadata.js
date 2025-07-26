// netlify/functions/getMetadata.js

const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  try {
    // The path is now simple: Go up one level from 'functions' to 'netlify', then down into 'data'.
    const dataPath = path.join(__dirname, '..', 'data', 'metadata.json');
    const metadata = fs.readFileSync(dataPath, 'utf-8');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: metadata,
    };
  } catch (error) {
    console.error('CRITICAL ERROR in getMetadata:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Server could not read metadata file.' }) };
  }
};
