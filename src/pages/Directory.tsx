import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Link } from 'react-router-dom';
import { Search, MapPin, GraduationCap, LayoutGrid, List, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Directory() {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), userId: doc.id }) as UserProfile);
        
        const sortedData = data.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          const getTime = (val: any) => typeof val?.toDate === 'function' ? val.toDate().getTime() : new Date(val).getTime();
          return getTime(b.createdAt) - getTime(a.createdAt);
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
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.matricNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.programme.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesYear = filterYear ? student.graduationYear === filterYear : true;

    return matchesSearch && matchesYear;
  });

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Class Directory</h1>
        <p className="text-lg text-slate-600">Discover and connect with your fellow graduates from Miva Open University.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-10">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name, matric number, location, or programme..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <select 
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
          >
            <option value="">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("p-2 rounded-lg transition-colors", viewMode === 'grid' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700")}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-2 rounded-lg transition-colors", viewMode === 'list' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700")}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No graduates found</h3>
          <p className="text-slate-500">Try adjusting your search filters.</p>
        </div>
      ) : (
        <div className={cn(
          "gap-6",
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "flex flex-col space-y-4"
        )}>
          {filteredStudents.map((student, idx) => (
            <motion.div
              key={student.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 0.5) }}
              className={cn(
                "bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all group",
                viewMode === 'list' ? "flex flex-row items-center p-4 gap-6" : "flex flex-col"
              )}
            >
              <div className={cn(
                "relative overflow-hidden bg-slate-100",
                viewMode === 'grid' ? "aspect-square w-full" : "w-24 h-24 rounded-full flex-shrink-0"
              )}>
                <img 
                  src={student.passportBase64} 
                  alt={student.fullName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              <div className={cn(
                "flex-1 flex flex-col",
                viewMode === 'grid' ? "p-6" : "py-2"
              )}>
                <h3 className="text-lg font-bold text-slate-900 truncate">{student.fullName}</h3>
                
                <div className="space-y-2 mt-3 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    <span className="truncate">{student.programme}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="truncate">{student.location}</span>
                  </div>
                </div>

                <Link 
                  to={`/profile/${student.userId}`}
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl font-medium transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}