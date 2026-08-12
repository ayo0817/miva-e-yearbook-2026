const fs = require('fs');
let code = fs.readFileSync('src/pages/Directory.tsx', 'utf-8');

code = code.replace(
  /<div className="flex gap-4 w-full md:w-auto">/g,
  '<div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">'
);

fs.writeFileSync('src/pages/Directory.tsx', code);
