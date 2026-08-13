import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { fileToBase64, compressImage } from '../lib/utils';
import { Upload, X, Check, Camera } from 'lucide-react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { UserProfile } from '../types';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full Name is required'),
  matricNumber: z.string().min(2, 'Matric Number is required'),
  telephoneNumber: z.string().min(5, 'Telephone Number is required'),
  location: z.string().min(2, 'Current Location is required'),
  programme: z.string().min(2, 'Programme is required'),
  graduationYear: z.string().min(4, 'Graduation Year is required'),
  socialLinks: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
  }).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function EditProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, profile, refreshProfile, deleteAccount } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Image crop state
  
  const handleDeleteAccount = async () => {
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
      setShowDeleteConfirm(false);
    }
  };

  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [croppedImageBase64, setCroppedImageBase64] = useState<string>('');
  const [isCropping, setIsCropping] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile ? {
      fullName: profile.fullName,
      matricNumber: profile.matricNumber,
      telephoneNumber: profile.telephoneNumber,
      location: profile.location,
      programme: profile.programme,
      graduationYear: profile.graduationYear,
      socialLinks: profile.socialLinks || {},
    } : {}
  });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName,
        matricNumber: profile.matricNumber,
        telephoneNumber: profile.telephoneNumber,
        location: profile.location,
        programme: profile.programme,
        graduationYear: profile.graduationYear,
        socialLinks: profile.socialLinks || {},
      });
      setCroppedImageBase64(profile.passportBase64 || '');
    }
  }, [profile, reset]);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); 
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setIsCropping(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width,
      height
    );
    setCrop(crop);
  };

  const getCroppedImg = async () => {
    if (!completedCrop || !imgRef.current) return;
    
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    const base64Image = canvas.toDataURL('image/jpeg', 0.9);
    const compressed = await compressImage(base64Image, 800, 800, 0.8);
    
    setCroppedImageBase64(compressed);
    setIsCropping(false);
    setImgSrc('');
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    if (!croppedImageBase64 && !profile) {
      setError("Please provide a passport photograph");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const uid = user.uid;
      const profileData = {
        ...data,
        passportBase64: croppedImageBase64,
        email: user.email,
        role: profile?.role || 'user',
        createdAt: profile?.createdAt || new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', uid), profileData, { merge: true });
      if (!profile) {
        await setDoc(doc(db, 'userImages', uid), { userId: uid, images: [] }, { merge: true });
      }
      
      await refreshProfile();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl my-8 relative overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900">{profile ? 'Edit Profile' : 'Complete Profile'}</h2>
          {profile && (
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
        
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 border-b pb-2 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input type="text" {...register('fullName')} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Matric Number *</label>
                  <input type="text" {...register('matricNumber')} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                  {errors.matricNumber && <p className="text-red-500 text-xs mt-1">{errors.matricNumber.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telephone Number *</label>
                  <input type="tel" {...register('telephoneNumber')} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                  {errors.telephoneNumber && <p className="text-red-500 text-xs mt-1">{errors.telephoneNumber.message}</p>}
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 border-b pb-2 mb-4">Academic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Programme *</label>
                  <input type="text" {...register('programme')} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                  {errors.programme && <p className="text-red-500 text-xs mt-1">{errors.programme.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Graduation Year *</label>
                  <select {...register('graduationYear')} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white">
                    <option value="">Select Year</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                  {errors.graduationYear && <p className="text-red-500 text-xs mt-1">{errors.graduationYear.message}</p>}
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 border-b pb-2 mb-4">Location</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Location *</label>
                  <input type="text" placeholder="e.g. Lagos, Nigeria" {...register('location')} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                </div>
              </div>
            </div>

            {/* Optional Info */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 border-b pb-2 mb-4">Optional Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
                    <input type="url" {...register('socialLinks.linkedin')} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Twitter URL</label>
                    <input type="url" {...register('socialLinks.twitter')} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                  </div>
                </div>
              </div>
            </div>

            {/* Passport Photo */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 border-b pb-2 mb-4">Passport Photograph {profile ? '' : '*'}</h3>
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50">
                
                {!isCropping && !croppedImageBase64 && (
                  <div className="text-center">
                    <Camera className="mx-auto h-12 w-12 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 mb-4">Upload a clear, front-facing passport photograph</p>
                    <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      <Upload className="w-4 h-4 mr-2" />
                      Select Image
                      <input type="file" accept="image/*" onChange={onSelectFile} className="hidden" />
                    </label>
                  </div>
                )}

                {isCropping && !!imgSrc && (
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-medium text-slate-700 mb-2">Crop your image to a square</p>
                    <div className="max-h-96 overflow-hidden rounded-lg mb-4 bg-black">
                      <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={1}
                        circularCrop={false}
                      >
                        <img ref={imgRef} alt="Crop me" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '50vh' }} />
                      </ReactCrop>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setIsCropping(false); setImgSrc(''); }} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition">Cancel</button>
                      <button type="button" onClick={getCroppedImg} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center">
                        <Check className="w-4 h-4 mr-2" /> Apply Crop
                      </button>
                    </div>
                  </div>
                )}

                {croppedImageBase64 && !isCropping && (
                  <div className="flex flex-col items-center">
                    <img src={croppedImageBase64} alt="Cropped passport" className="w-32 h-32 object-cover rounded-xl shadow-md border-2 border-white mb-4" />
                    <div className="flex gap-2">
                      <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        Change Photo
                        <input type="file" accept="image/*" onChange={onSelectFile} className="hidden" />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t flex gap-4">
              {profile && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 px-8 border border-slate-300 rounded-xl shadow-sm text-lg font-medium text-slate-700 bg-white hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center py-4 px-8 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Saving...
                  </span>
                ) : (
                  profile ? 'Save Changes' : 'Create Profile'
                )}
              </button>

            </div>
            {profile && (
              <div className="pt-6 mt-6 border-t border-red-100">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
                <p className="text-sm text-slate-500 mb-4">Deleting your profile is permanent and cannot be undone. All your data will be erased.</p>
                {showDeleteConfirm ? (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                    <p className="text-red-700 font-medium mb-4">Are you absolutely sure you want to delete your account? This cannot be undone.</p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                      >
                        {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                        className="flex-1 py-3 px-4 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-4 px-8 border border-red-500 text-red-600 rounded-xl shadow-sm text-lg font-medium hover:bg-red-50 transition-all"
                  >
                    Delete Profile
                  </button>
                )}
              </div>
            )}
          </form>

        </div>
      </div>
    </div>
  );
}
