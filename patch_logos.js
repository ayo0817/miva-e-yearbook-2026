const fs = require('fs');

let layoutCode = fs.readFileSync('src/components/Layout.tsx', 'utf-8');
layoutCode = layoutCode.replace(
  /<Link to="\/" className="flex items-center gap-2 group">[\s\S]*?<div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors">[\s\S]*?<GraduationCap className="h-6 w-6 text-yellow-400" \/>[\s\S]*?<\/div>[\s\S]*?<span className="font-bold text-xl tracking-tight text-blue-900">Miva Yearbook<\/span>[\s\S]*?<\/Link>/m,
  '<Link to="/" className="flex items-center group">\\n              <img src="https://miva-university.s3.eu-west-2.amazonaws.com/wp-content/uploads/2026/05/22180831/Miva-Logo-Blue-Horizontal-1.png" alt="Miva Open University" className="h-10 object-contain" />\\n            </Link>'
);
fs.writeFileSync('src/components/Layout.tsx', layoutCode);

let loginCode = fs.readFileSync('src/pages/Login.tsx', 'utf-8');
loginCode = loginCode.replace(
  /<div className="flex justify-center">[\s\S]*?<div className="bg-blue-600 p-3 rounded-2xl shadow-lg">[\s\S]*?<GraduationCap className="h-10 w-10 text-yellow-400" \/>[\s\S]*?<\/div>[\s\S]*?<\/div>/m,
  '<div className="flex justify-center mb-4">\\n          <img src="https://miva-university.s3.eu-west-2.amazonaws.com/wp-content/uploads/2026/05/22180831/Miva-Logo-Blue-Horizontal-1.png" alt="Miva Open University" className="h-16 object-contain" />\\n        </div>'
);
fs.writeFileSync('src/pages/Login.tsx', loginCode);

let homeCode = fs.readFileSync('src/pages/Home.tsx', 'utf-8');
homeCode = homeCode.replace(
  /<GraduationCap className="h-12 w-12 text-yellow-400" \/>/m,
  '<img src="https://miva-university.s3.eu-west-2.amazonaws.com/wp-content/uploads/2026/05/22174501/Miva-Logo-White-Horizontal-1.png" alt="Miva Open University" className="h-16 object-contain px-2" />'
);
fs.writeFileSync('src/pages/Home.tsx', homeCode);

let profileCode = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');
profileCode = profileCode.replace(
  /<div className="flex items-center gap-2">[\s\S]*?<GraduationCap className="h-8 w-8 text-blue-800" \/>[\s\S]*?<span className="font-bold text-lg text-blue-900 uppercase tracking-widest">Miva Open University<\/span>[\s\S]*?<\/div>/m,
  '<div className="flex items-center">\\n                    <img src="https://miva-university.s3.eu-west-2.amazonaws.com/wp-content/uploads/2026/05/22180831/Miva-Logo-Blue-Horizontal-1.png" alt="Miva Open University" className="h-10 object-contain" />\\n                  </div>'
);
fs.writeFileSync('src/pages/Profile.tsx', profileCode);
