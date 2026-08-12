import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Image as ImageIcon, Users, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-blue-900 text-white shadow-2xl py-20 px-6 sm:px-12 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          {/* Abstract background shapes */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-48 -left-48 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-24 right-48 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-4 border border-white/20 shadow-xl"
          >
            <img src="https://miva-university.s3.eu-west-2.amazonaws.com/wp-content/uploads/2026/05/22174501/Miva-Logo-White-Horizontal-1.png" alt="Miva Open University" className="h-16 object-contain px-2" />
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-sm"
          >
            Congratulations, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
              Miva Open University
            </span> Graduates!
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-2xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Celebrate, Connect, and Preserve Our Graduation Memories Forever.
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            {!user ? (
              <Link
                to="/register"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-blue-900 bg-yellow-400 hover:bg-yellow-300 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Create Your Profile <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-blue-900 bg-yellow-400 hover:bg-yellow-300 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            )}
            <Link
              to="/directory"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all border border-white/20"
            >
              Browse Directory
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="bg-blue-50 p-4 rounded-full text-blue-600">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Alumni Directory</h3>
            <p className="text-slate-600">Find and connect with your classmates. Search by programme, location, or graduation year.</p>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="bg-yellow-50 p-4 rounded-full text-yellow-600">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Digital E-Card</h3>
            <p className="text-slate-600">Automatically generate a beautiful graduation e-card to share with family and friends on social media.</p>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="bg-purple-50 p-4 rounded-full text-purple-600">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Memory Galleries</h3>
            <p className="text-slate-600">Upload your personal graduation photos and contribute to the shared class gallery and memory wall.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}