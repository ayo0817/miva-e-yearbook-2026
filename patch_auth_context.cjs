const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf-8');

code = code.replace(
  "import { User, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';",
  "import { User, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';"
);

code = code.replace(
  "import { doc, getDoc, setDoc } from 'firebase/firestore';",
  "import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';"
);

code = code.replace(
  "  logout: () => Promise<void>;\n  refreshProfile: () => Promise<void>;",
  "  logout: () => Promise<void>;\n  refreshProfile: () => Promise<void>;\n  deleteAccount: () => Promise<void>;"
);

code = code.replace(
  "  logout: async () => {},\n  refreshProfile: async () => {},",
  "  logout: async () => {},\n  refreshProfile: async () => {},\n  deleteAccount: async () => {},"
);

code = code.replace(
  "  const logout = async () => {\n    await signOut(auth);\n  };",
  "  const logout = async () => {\n    await signOut(auth);\n  };\n\n  const deleteAccount = async () => {\n    if (!user) return;\n    const uid = user.uid;\n    await deleteDoc(doc(db, 'users', uid));\n    await deleteDoc(doc(db, 'userImages', uid));\n    await deleteUser(user);\n    setUser(null);\n    setProfile(null);\n  };"
);

code = code.replace(
  "value={{ user, profile, loading, login, register, logout, refreshProfile }}>",
  "value={{ user, profile, loading, login, register, logout, refreshProfile, deleteAccount }}>"
);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
