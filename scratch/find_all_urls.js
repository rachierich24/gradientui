const fs = require('fs');

try {
  const content = fs.readFileSync('C:/Users/shriyansh Sharma/.gemini/antigravity/brain/19c4ab20-86a1-42ea-b5b2-b8140e9268b8/.system_generated/logs/transcript.jsonl', 'utf8');
  const matches = content.match(/https?:\/\/[^\s"'\\<>\)]+/gi);
  const filtered = [...new Set(matches || [])].filter(url => 
    !url.includes('google') && 
    !url.includes('github') && 
    !url.includes('schema.org') && 
    !url.includes('localhost') && 
    !url.includes('w3.org')
  );
  console.log('Filtered URLs:', filtered);
} catch (e) {
  console.error(e);
}

