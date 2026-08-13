const fs = require('fs');
let code = fs.readFileSync('src/components/EditProfileModal.tsx', 'utf-8');

code = code.replace(
  "  const [isDeleting, setIsDeleting] = useState(false);",
  "  const [isDeleting, setIsDeleting] = useState(false);\n  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);"
);

const oldHandleDelete = `  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your profile? This action is irreversible.")) {
      setIsDeleting(true);
      try {
        await deleteAccount();
        onClose();
      } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/requires-recent-login') {
          setError("Please log out and log back in to delete your account.");
        } else {
          setError("Failed to delete account. Please try again.");
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };`;

const newHandleDelete = `  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setError("Please log out and log back in to delete your account.");
      } else {
        setError("Failed to delete account. Please try again.");
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };`;

code = code.replace(oldHandleDelete, newHandleDelete);

const oldButtonBlock = `                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="w-full py-4 px-8 border border-red-500 text-red-600 rounded-xl shadow-sm text-lg font-medium hover:bg-red-50 transition-all disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Profile'}
                </button>`;

const newButtonBlock = `                {showDeleteConfirm ? (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                    <p className="text-red-700 font-medium mb-4">Are you absolutely sure you want to delete your account? This cannot be undone.</p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                      >
                        {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                        className="flex-1 py-3 px-4 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-4 px-8 border border-red-500 text-red-600 rounded-xl shadow-sm text-lg font-medium hover:bg-red-50 transition-all"
                  >
                    Delete Profile
                  </button>
                )}`;

code = code.replace(oldButtonBlock, newButtonBlock);

fs.writeFileSync('src/components/EditProfileModal.tsx', code);
