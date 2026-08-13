const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');

code = code.replace(
  "      allow delete: if isAdmin();",
  "      allow delete: if isAuthenticated() && (isOwner(userId) || isAdmin());"
);

fs.writeFileSync('firestore.rules', code);
