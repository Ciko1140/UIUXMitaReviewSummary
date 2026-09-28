import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// The cleanest approach is to use the first script but run it carefully.
