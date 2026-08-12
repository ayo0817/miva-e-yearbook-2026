import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { fileToBase64, compressImage } from '../lib/utils';
import { Link } from 'react-router-dom';
import EditProfileModal from '../components/EditProfileModal';
import { Upload, X, Trash2, Camera, ExternalLink, Edit } from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'userImages', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setGallery(docSnap.data().images || []);
          }
        } catch (error) {
          console.error("Error fetching gallery", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchGallery();
  }, [user]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const acceptedFiles = Array.from(e.target.files) as File[];
    
    if (!user || gallery.length + acceptedFiles.length > 10) {
      alert('You can only upload up to 10 images in total.');
      return;
    }

    setUploading(true);
    try {
      const docRef = doc(db, 'userImages', user.uid);
      
      for (const file of acceptedFiles) {
        const base64 = await fileToBase64(file);
        const compressed = await compressImage(base64, 1200, 1200, 0.8);
        
        await setDoc(docRef, {
          images: arrayUnion(compressed)
        }, { merge: true });
        setGallery(prev => [...prev, compressed]);
      }
    } catch (error) {
      console.error("Upload error", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageStr: string) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'userImages', user.uid);
      await updateDoc(docRef, {
        images: arrayRemove(imageStr)
      });
      setGallery(prev => prev.filter(img => img !== imageStr));
    } catch (error) {
      console.error("Delete error", error);
    }
  };

  if (!profile) return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Complete Your Profile</h2>
        <p className="text-slate-600 mb-6">Your profile hasn't been set up yet. Please complete it to access the dashboard.</p>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
        >
          Set Up Profile
        </button>
      </div>
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-6">
          <img 
            src={profile.passportBase64} 
            alt={profile.fullName} 
            className="w-24 h-24 rounded-full object-cover shadow-sm border-2 border-white ring-2 ring-slate-100"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {profile.fullName}</h1>
            <p className="text-slate-500">{profile.programme} • Class of {profile.graduationYear}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition"
          >
            <Edit className="w-4 h-4" /> Edit Profile
          </button>
          <Link 
            to={`/profile/${user?.uid}`}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            View Public Profile <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-slate-900">Graduation Gallery</h2>
          <p className="text-slate-500 text-sm mt-1">Upload up to 10 graduation pictures. ({gallery.length}/10 uploaded)</p>
        </div>

        {gallery.length < 10 && (
          <label 
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors block border-slate-300 bg-slate-50 hover:bg-slate-100`}
          >
            <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" disabled={uploading} />
            <Camera className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            {uploading ? (
              <p className="text-slate-600 font-medium">Processing and uploading...</p>
            ) : (
              <div>
                <p className="text-slate-700 font-medium">Click here to select images to upload</p>
                <p className="text-slate-500 text-sm mt-2">High resolution photos will be automatically compressed.</p>
              </div>
            )}
          </label>
        )}

        {loading ? (
          <div className="mt-8 text-center text-slate-500">Loading gallery...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-8">
            {gallery.map((img, index) => (
              <div key={index} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100">
                <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => handleDeleteImage(img)}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}