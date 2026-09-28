import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Due to repeated states in App.tsx we need to remove the first duplication.
// Let's just restore the file once again and patch exactly step-by-step
