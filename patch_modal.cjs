const fs = require('fs');
let code = fs.readFileSync('src/components/EditProfileModal.tsx', 'utf-8');

code = code.replace(
  "const { user, profile, refreshProfile } = useAuth();",
  "const { user, profile, refreshProfile, deleteAccount } = useAuth();\n  const [isDeleting, setIsDeleting] = useState(false);"
);

const deleteFunc = `
  const handleDeleteAccount = async () => {
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
  };
`;

code = code.replace(
  "const [imgSrc, setImgSrc] = useState('');",
  deleteFunc + "\n  const [imgSrc, setImgSrc] = useState('');"
);

const deleteBtn = `
            </div>
            {profile && (
              <div className="pt-6 mt-6 border-t border-red-100">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
                <p className="text-sm text-slate-500 mb-4">Deleting your profile is permanent and cannot be undone. All your data will be erased.</p>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="w-full py-4 px-8 border border-red-500 text-red-600 rounded-xl shadow-sm text-lg font-medium hover:bg-red-50 transition-all disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Profile'}
                </button>
              </div>
            )}
          </form>
`;

code = code.replace(
  "            </div>\n          </form>",
  deleteBtn
);

fs.writeFileSync('src/components/EditProfileModal.tsx', code);
