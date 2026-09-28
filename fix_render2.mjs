import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(
  '            </div>\n          </div>\n        )\n        )}\n      </section>',
  '            </div>\n          </div>\n        )}\n      </section>'
);
fs.writeFileSync('src/App.tsx', content);

