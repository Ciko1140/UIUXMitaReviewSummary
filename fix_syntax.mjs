import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace the bad rendering logic block
content = content.replace(
  '        ) : (\n          {active === "Memory" ? (',
  '        ) : active === "Memory" ? ('
);

fs.writeFileSync('src/App.tsx', content);
