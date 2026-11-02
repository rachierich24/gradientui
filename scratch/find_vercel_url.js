const fs = require('fs');

try {
  const content = fs.readFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/.system_generated/logs/transcript.jsonl', 'utf8');
  const matches = content.match(/https?:\/\/[a-zA-Z0-9\-\._]+\.vercel\.app[^\s"'\\<>]*/gi);
  console.log('Matches:', [...new Set(matches || [])]);
} catch (e) {
  console.error(e);
}

