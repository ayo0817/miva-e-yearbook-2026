import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, Image as ImageIcon, MessageSquare, LogOut, LayoutDashboard, UserPlus, LogIn, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Directory', path: '/directory', icon: Users },
    { name: 'Memory Wall', path: '/memory-wall', icon: MessageSquare },
    { name: 'Class Gallery', path: '/class-gallery', icon: ImageIcon },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <img src="https://miva-university.s3.eu-west-2.amazonaws.com/wp-content/uploads/2026/05/22180831/Miva-Logo-Blue-Horizontal-1.png" alt="Miva Open University" className="h-10 object-contain" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    location.pathname === link.path
                      ? "text-blue-700 bg-blue-50"
                      : "text-slate-600 hover:text-blue-600 hover:bg-slate-100"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              ))}
              
              <div className="h-6 w-px bg-slate-300 mx-2" />

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      location.pathname === '/dashboard'
                        ? "text-blue-700 bg-blue-50"
                        : "text-slate-600 hover:text-blue-600 hover:bg-slate-100"
                    )}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-all hover:shadow"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create Profile
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-500 hover:text-slate-700 p-2"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 text-base font-medium rounded-md",
                      location.pathname === link.path
                        ? "text-blue-700 bg-blue-50"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                ))}
                
                <div className="h-px bg-slate-200 my-4" />
                
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="flex w-full items-center gap-3 px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 mt-4">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 shadow-sm text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
                    >
                      <LogIn className="w-5 h-5" />
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 px-4 py-2.5 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="w-5 h-5" />
                      Create Profile
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="https://miva-university.s3.eu-west-2.amazonaws.com/wp-content/uploads/2026/05/22180831/Miva-Logo-Blue-Horizontal-1.png" alt="Miva Open University" className="h-6 object-contain" />
            <span className="font-semibold text-slate-900">Miva Open University</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Miva Digital Yearbook. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}