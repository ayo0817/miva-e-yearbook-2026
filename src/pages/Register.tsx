import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { fileToBase64, compressImage } from '../lib/utils';
import { Upload, X, Check, Camera } from 'lucide-react';
import ReactCrop, { Crop, PixelCrop, makeAspectCrop, centerCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const registerSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
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

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Image crop state
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [croppedImageBase64, setCroppedImageBase64] = useState<string>('');
  const [isCropping, setIsCropping] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); 
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
      setIsCropping(true);
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

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    const base64Image = canvas.toDataURL('image/jpeg', 0.8);
    const compressedImage = await compressImage(base64Image, 400, 400, 0.8);
    setCroppedImageBase64(compressedImage);
    setIsCropping(false);
  };

  const { register: registerAuth } = useAuth();

  const onSubmit = async (data: RegisterFormValues) => {
    if (!croppedImageBase64) {
      setError('Please upload and crop a passport photograph.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const profileData = {
        fullName: data.fullName,
        matricNumber: data.matricNumber,
        telephoneNumber: data.telephoneNumber,
        location: data.location,
        programme: data.programme,
        graduationYear: data.graduationYear,
        passportBase64: croppedImageBase64,
        socialLinks: data.socialLinks || {},
      };

      await registerAuth(data.email, data.password, profileData as any);

      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-blue-600 p-8 text-center">
        <h1 className="text-3xl font-bold text-white">Create Your Graduate Profile</h1>
        <p className="text-blue-100 mt-2">Join the digital yearbook and celebrate your achievement</p>
      </div>

      <div className="p-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center gap-2">
            <X className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Account Details */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 border-b pb-2 mb-4">Account Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                <input type="email" {...register('email')} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                <input type="password" {...register('password')} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 border-b pb-2 mb-4">Personal Information</h2>
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
            <h2 className="text-xl font-semibold text-slate-900 border-b pb-2 mb-4">Academic Information</h2>
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
            <h2 className="text-xl font-semibold text-slate-900 border-b pb-2 mb-4">Location</h2>
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
            <h2 className="text-xl font-semibold text-slate-900 border-b pb-2 mb-4">Optional Details</h2>
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
            <h2 className="text-xl font-semibold text-slate-900 border-b pb-2 mb-4">Passport Photograph *</h2>
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

          <div className="pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-8 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Creating Profile...
                </span>
              ) : (
                'Create Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}