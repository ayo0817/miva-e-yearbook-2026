const fs = require('fs');

['src/components/Layout.tsx', 'src/pages/Login.tsx', 'src/pages/Home.tsx', 'src/pages/Profile.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  if (file !== 'src/pages/Home.tsx' && file !== 'src/pages/Directory.tsx') {
    code = code.replace(/GraduationCap, /g, '');
    code = code.replace(/GraduationCap /g, '');
    code = code.replace(/, GraduationCap/g, '');
  }
  fs.writeFileSync(file, code);
});
