const fs = require('fs');

let layoutCode = fs.readFileSync('src/components/Layout.tsx', 'utf-8');
layoutCode = layoutCode.replace(
  /<\/header>\n      <main/m,
  '</header>\n      <div className="bg-red-500 text-white text-center py-2.5 px-4 text-sm font-medium">\n        Admission for the September 2026 cohort is ongoing. <a href="#" className="underline font-bold hover:text-red-100">Apply Now!</a>\n      </div>\n      <main'
);
fs.writeFileSync('src/components/Layout.tsx', layoutCode);
