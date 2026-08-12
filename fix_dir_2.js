import fs from 'fs';
let code = fs.readFileSync('src/pages/Directory.tsx', 'utf-8');

code = code.replace(
  `  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.matricNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.programme.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesYear = filterYear ? student.graduationYear === filterYear : true;

    return matchesSearch && matchesYear;
  });`,
  `  const filteredStudents = students.filter(student => {
    if (!student.fullName) return false;

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (student.fullName || '').toLowerCase().includes(searchLower) ||
      (student.matricNumber || '').toLowerCase().includes(searchLower) ||
      (student.location || '').toLowerCase().includes(searchLower) ||
      (student.programme || '').toLowerCase().includes(searchLower);
      
    const matchesYear = filterYear ? student.graduationYear === filterYear : true;

    return matchesSearch && matchesYear;
  });`
);

fs.writeFileSync('src/pages/Directory.tsx', code);
