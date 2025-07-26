// netlify/functions/getMetadata.js -- WITH DEBUGGING CODE

const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  // Let's construct the path we expect the file to be at.
  // This path logic is correct. If it fails, the file isn't there.
  const dataPath = path.join(__dirname, '..', '..', 'data', 'metadata.json');

  try {
    // --- TEMPORARY DEBUGGING LOGS ---
    // These will show up in your Netlify Function logs.
    const rootContents = fs.readdirSync(path.join(__dirname, '..', '..'));
    console.log("DEBUG: Root directory contents:", rootContents);
    // --- END DEBUGGING LOGS ---

    const metadata = fs.readFileSync(dataPath, 'utf-8');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: metadata,
    };
  } catch (error) {
    // If it fails, return a MUCH more helpful error message.
    console.error('CRITICAL ERROR:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Could not load metadata file.',
        // This tells us the exact path the code tried to access.
        triedPath: dataPath,
        // This will show us what was actually in the directory.
        // If 'data' is not in this list, netlify.toml is the problem.
        foundInRoot: fs.readdirSync(path.join(__dirname, '..', '..')),
      }),
    };
  }
};
