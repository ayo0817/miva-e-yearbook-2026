import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile, UserImages } from '../types';
import { MapPin, GraduationCap, Mail, Phone, Calendar, BookOpen, Share2, Download, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion } from 'motion/react';

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const eCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }

        const galleryRef = doc(db, 'userImages', id);
        const gallerySnap = await getDoc(galleryRef);
        if (gallerySnap.exists()) {
          setGallery(gallerySnap.data().images || []);
        }
      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleDownloadPNG = async () => {
    if (!eCardRef.current || !profile) return;
    try {
      const canvas = await html2canvas(eCardRef.current, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `${profile.fullName.replace(/\s+/g, '_')}_Graduation_Card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating PNG', error);
    }
  };

  const handleDownloadPDF = async () => {
    if (!eCardRef.current || !profile) return;
    try {
      const canvas = await html2canvas(eCardRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${profile.fullName.replace(/\s+/g, '_')}_Graduation_Card.pdf`);
    } catch (error) {
      console.error('Error generating PDF', error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Profile link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h3>
        <p className="text-slate-500">The graduate you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Section: Profile Info & E-Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Profile Details */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="h-32 bg-blue-600 relative">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-300 via-transparent to-transparent"></div>
            </div>
            
            <div className="px-8 pb-8 relative">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 mb-6">
                <img 
                  src={profile.passportBase64} 
                  alt={profile.fullName} 
                  className="w-32 h-32 rounded-2xl object-cover shadow-lg border-4 border-white bg-white"
                />
                <div className="flex-1">
                  <h1 className="text-3xl font-extrabold text-slate-900">{profile.fullName}</h1>
                  <p className="text-blue-600 font-medium text-lg">{profile.programme}</p>
                </div>
                <div className="hidden sm:block bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                   <QRCodeSVG value={window.location.href} size={80} fgColor="#1e3a8a" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mt-8">
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><BookOpen className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Matric Number</p>
                    <p className="font-medium">{profile.matricNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Calendar className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Class of</p>
                    <p className="font-medium">{profile.graduationYear}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><MapPin className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Location</p>
                    <p className="font-medium">{profile.location}</p>
                  </div>
                </div>
                {profile.telephoneNumber && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Phone className="w-5 h-5" /></div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Phone</p>
                      <p className="font-medium">{profile.telephoneNumber}</p>
                    </div>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Mail className="w-5 h-5" /></div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Email</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {profile.socialLinks && Object.values(profile.socialLinks).some(val => !!val) && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Connect</h3>
                  <div className="flex gap-4">
                    {profile.socialLinks.linkedin && (
                      <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-colors">
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {profile.socialLinks.twitter && (
                      <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-sky-50 text-sky-500 hover:bg-sky-100 rounded-xl transition-colors">
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {profile.socialLinks.facebook && (
                      <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors">
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {profile.socialLinks.instagram && (
                      <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-xl transition-colors">
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: E-Card Generator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
            {/* The E-Card Element for rendering */}
            <div 
              ref={eCardRef}
              className="bg-white rounded-2xl overflow-hidden shadow-inner relative"
              style={{ width: '100%', aspectRatio: '3/4' }}
            >
              {/* Card Background Pattern */}
              <div className="absolute inset-0 bg-blue-50 opacity-50"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-between p-8 text-center z-10 border-8 border-white">
                
                <div className="w-full flex justify-center pt-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-8 w-8 text-blue-800" />
                    <span className="font-bold text-lg text-blue-900 uppercase tracking-widest">Miva Open University</span>
                  </div>
                </div>

                <div className="flex flex-col items-center w-full my-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full border-4 border-yellow-400 blur-sm"></div>
                    <img 
                      src={profile.passportBase64} 
                      alt={profile.fullName} 
                      className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-xl relative z-10"
                    />
                  </div>
                  
                  <div className="mt-8 space-y-2">
                    <p className="text-yellow-600 font-bold tracking-widest uppercase text-sm">Class of {profile.graduationYear}</p>
                    <h2 className="text-3xl font-extrabold text-blue-900 leading-tight">{profile.fullName}</h2>
                    <p className="text-slate-600 font-medium px-4">{profile.programme}</p>
                  </div>
                </div>

                <div className="w-full border-t border-slate-200 pt-6 flex justify-between items-end">
                  <div className="text-left">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Matric No.</p>
                    <p className="text-sm font-bold text-slate-800">{profile.matricNumber}</p>
                  </div>
                  <div className="opacity-80">
                     <QRCodeSVG value={window.location.href} size={50} fgColor="#1e3a8a" />
                  </div>
                </div>

              </div>
            </div>

            {/* Floating Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleDownloadPNG}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-xl font-bold transition-colors"
              >
                <Download className="w-4 h-4" /> PNG
              </button>
              <button 
                onClick={handleDownloadPDF}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
              >
                <Download className="w-4 h-4" /> PDF
              </button>
              <button 
                onClick={handleCopyLink}
                className="flex-none flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors border border-white/10"
                title="Copy Link"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Graduation Gallery Section */}
      {gallery.length > 0 && (
        <div className="pt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            Graduation Gallery <span className="text-sm font-medium bg-blue-100 text-blue-700 py-1 px-3 rounded-full">{gallery.length} Photos</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((img, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                key={idx} 
                className="aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow"
              >
                <img src={img} alt={`Graduation ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}