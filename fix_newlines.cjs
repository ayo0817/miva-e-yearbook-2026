const fs = require('fs');
['src/components/Layout.tsx', 'src/pages/Login.tsx', 'src/pages/Home.tsx', 'src/pages/Profile.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  code = code.replace(/\\n/g, '\n');
  fs.writeFileSync(file, code);
});
