import fs from 'fs';
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(
  `<Link \n          to={\`/profile/\${user?.uid}\`}\n          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"\n        >\n          View Public Profile <ExternalLink className="w-4 h-4" />\n        </Link>\n        </div>\n      </div>`,
  `<div className="flex items-center gap-4">\n          <button \n            onClick={() => setIsEditModalOpen(true)}\n            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition"\n          >\n            <Edit className="w-4 h-4" /> Edit Profile\n          </button>\n          <Link \n            to={\`/profile/\${user?.uid}\`}\n            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"\n          >\n            View Public Profile <ExternalLink className="w-4 h-4" />\n          </Link>\n        </div>\n      </div>`
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
