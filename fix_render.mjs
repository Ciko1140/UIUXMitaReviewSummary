import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(
  '        ) : (\n                  ) : active === "Memory" ? (',
  '        ) : active === "Memory" ? ('
);
fs.writeFileSync('src/App.tsx', content);

