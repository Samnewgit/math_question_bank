const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  try {
    // This uses the same correct pathing logic.
    const dataPath = path.join(__dirname, '..', '..', 'data', 'metadata.json');

    const metadata = fs.readFileSync(dataPath, 'utf-8');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: metadata,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Could not load metadata.' }),
    };
  }
};
