import fs from 'fs';
let code = fs.readFileSync('src/pages/Directory.tsx', 'utf-8');

code = code.replace(
  "import { collection, getDocs, query, orderBy } from 'firebase/firestore';",
  "import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';"
);

code = code.replace(
  `  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(collection(db, 'users'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ ...doc.data(), userId: doc.id }) as UserProfile);
        
        // Sort in memory to avoid excluding users without createdAt
        const sortedData = data.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setStudents(sortedData);
      } catch (error) {
        console.error("Error fetching directory", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);`,
  `  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), userId: doc.id }) as UserProfile);
        
        const sortedData = data.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setStudents(sortedData);
      } catch (error) {
        console.error("Error processing directory data", error);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("Error fetching directory", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);`
);

fs.writeFileSync('src/pages/Directory.tsx', code);
