const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf-8');
code = code.replace(
  /<className="h-5 w-5 text-blue-600" \/>/m,
  '<img src="https://miva-university.s3.eu-west-2.amazonaws.com/wp-content/uploads/2026/05/22180831/Miva-Logo-Blue-Horizontal-1.png" alt="Miva Open University" className="h-6 object-contain" />'
);
fs.writeFileSync('src/components/Layout.tsx', code);
