const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(
  /<div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">\n        <div className="flex items-center gap-6">\n          <img \n            src={profile.passportBase64} \n            alt={profile.fullName} \n            className="w-24 h-24 rounded-full object-cover shadow-sm border-2 border-white ring-2 ring-slate-100"\n          \/>\n          <div>\n            <h1 className="text-2xl font-bold text-slate-900">Welcome, \{profile.fullName\}<\/h1>\n            <p className="text-slate-500">\{profile.programme\} • Class of \{profile.graduationYear\}<\/p>\n          <\/div>\n        <\/div>\n        <div className="flex items-center gap-4">/g,
  `<div className="flex flex-col md:flex-row justify-between items-center md:items-start bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
          <img 
            src={profile.passportBase64} 
            alt={profile.fullName} 
            className="w-24 h-24 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover shadow-sm border-2 border-white ring-2 ring-slate-100"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {profile.fullName}</h1>
            <p className="text-slate-500">{profile.programme} • Class of {profile.graduationYear}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch md:items-center gap-3">`
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
