import fs from 'fs';
let code = fs.readFileSync('src/pages/Directory.tsx', 'utf-8');

code = code.replace(
  `        const sortedData = data.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });`,
  `        const sortedData = data.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          const getTime = (val: any) => typeof val?.toDate === 'function' ? val.toDate().getTime() : new Date(val).getTime();
          return getTime(b.createdAt) - getTime(a.createdAt);
        });`
);

fs.writeFileSync('src/pages/Directory.tsx', code);
