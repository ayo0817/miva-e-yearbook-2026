const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(
  "import { Link } from 'react-router-dom';",
  "import { Link } from 'react-router-dom';\nimport EditProfileModal from '../components/EditProfileModal';"
);

code = code.replace(
  "const { user, profile } = useAuth();",
  "const { user, profile } = useAuth();\n  const [isEditModalOpen, setIsEditModalOpen] = useState(false);"
);

code = code.replace(
  "import { Upload, X, Trash2, Camera, ExternalLink } from 'lucide-react';",
  "import { Upload, X, Trash2, Camera, ExternalLink, Edit } from 'lucide-react';"
);

code = code.replace(
  "if (!profile) return <div>Loading...</div>;",
  `if (!profile) return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Complete Your Profile</h2>
        <p className="text-slate-600 mb-6">Your profile hasn't been set up yet. Please complete it to access the dashboard.</p>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
        >
          Set Up Profile
        </button>
      </div>
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </div>
  );`
);

code = code.replace(
  "<Link \n          to={`/profile/${user?.uid}`}",
  `<button 
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition"
        >
          <Edit className="w-4 h-4" /> Edit Profile
        </button>
        <Link 
          to={\`/profile/\${user?.uid}\`}`
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
