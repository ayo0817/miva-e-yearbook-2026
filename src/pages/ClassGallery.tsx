import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc, serverTimestamp, increment, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ClassGalleryImage } from '../types';
import { Heart, Trash2, Upload, Eye, X, MessageCircle, ImageIcon, Loader2, Image as ImageIconLucide } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

const MAX_FILES = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ClassGallery() {
  const { user, profile } = useAuth();
  const [images, setImages] = useState<ClassGalleryImage[]>([]);
  const [sortMode, setSortMode] = useState<'newest' | 'liked' | 'viewed'>('newest');
  const [lightboxImage, setLightboxImage] = useState<ClassGalleryImage | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Comments state for lightbox
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'classGallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let fetchedImages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ClassGalleryImage[];
      setImages(fetchedImages);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch comments when lightbox opens
  useEffect(() => {
    if (lightboxImage?.id) {
      const q = query(collection(db, `classGallery/${lightboxImage.id}/comments`), orderBy('createdAt', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    } else {
      setComments([]);
    }
  }, [lightboxImage]);

  const sortedImages = [...images].sort((a, b) => {
    if (sortMode === 'liked') return b.likes - a.likes;
    if (sortMode === 'viewed') return (b.views || 0) - (a.views || 0);
    return 0; // default is 'newest' based on query
  });

  const toggleLike = async (imageId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'classGallery', imageId), {
        likes: increment(1)
      });
      if (lightboxImage && lightboxImage.id === imageId) {
        setLightboxImage(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }
    } catch (error) {
      console.error("Error liking", error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !lightboxImage?.id || !newComment.trim()) return;
    
    try {
      await addDoc(collection(db, `classGallery/${lightboxImage.id}/comments`), {
        authorId: profile?.userId || user.uid,
        authorName: profile?.fullName || user.email?.split('@')[0] || 'Unknown User',
        content: newComment.trim(),
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'classGallery', lightboxImage.id), {
        commentsCount: increment(1)
      });
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment', error);
      toast.error('Failed to post comment');
    }
  };

  const handleDelete = async (imageId: string) => {
    if (window.confirm("Are you sure you want to delete this picture?")) {
      try {
        await deleteDoc(doc(db, 'classGallery', imageId));
        toast.success("Photo deleted");
        if (lightboxImage?.id === imageId) {
          setLightboxImage(null);
        }
      } catch (e) {
        toast.error("Failed to delete photo");
      }
    }
  };

  const openLightbox = async (img: ClassGalleryImage) => {
    setLightboxImage(img);
    if (img.id) {
      await updateDoc(doc(db, 'classGallery', img.id), {
        views: increment(1)
      });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <Toaster position="bottom-right" />
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Class Gallery</h1>
          <p className="text-lg text-slate-600">A shared collection of group pictures, convocation photos, and campus memories.</p>
        </div>
        {user && (
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm font-medium whitespace-nowrap"
          >
            <Upload className="w-5 h-5" /> Upload Graduation Photos
          </button>
        )}
      </div>

      {images.length > 0 && (
        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 inline-flex mb-6">
          <button onClick={() => setSortMode('newest')} className={`px-4 py-2 rounded-lg font-medium transition ${sortMode === 'newest' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>Newest</button>
          <button onClick={() => setSortMode('liked')} className={`px-4 py-2 rounded-lg font-medium transition ${sortMode === 'liked' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>Most Liked</button>
          <button onClick={() => setSortMode('viewed')} className={`px-4 py-2 rounded-lg font-medium transition ${sortMode === 'viewed' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>Most Viewed</button>
        </div>
      )}

      {!isLoading && images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm px-4">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-500">
            <ImageIconLucide className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">No graduation photos have been shared yet.</h2>
          <p className="text-slate-600 mb-8 max-w-md">Be the first to upload your memories and share them with the graduating class!</p>
          {user && (
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md font-medium text-lg"
            >
              <Upload className="w-6 h-6" /> Upload Your First Photo
            </button>
          )}
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {sortedImages.map((img) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="break-inside-avoid relative group bg-white p-3 rounded-2xl shadow-sm border border-slate-100"
            >
              <div className="relative rounded-xl overflow-hidden cursor-pointer" onClick={() => openLightbox(img)}>
                <img src={img.imageUrl || img.imageBase64} alt={img.caption || 'Graduation Photo'} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                  <div className="flex items-center gap-1 font-medium"><Eye className="w-5 h-5" /> View Fullscreen</div>
                </div>
              </div>
              <div className="pt-4 pb-2 px-1">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">{img.authorName}</p>
                    <p className="text-xs text-slate-500">{img.authorMatricNumber || 'Graduating Class'}</p>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {img.createdAt ? formatDistanceToNow(img.createdAt.toDate(), { addSuffix: true }) : ''}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <div className="flex gap-4">
                    <button onClick={() => toggleLike(img.id!)} disabled={!user} className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition text-sm font-medium">
                      <Heart className="w-4 h-4" /> {img.likes}
                    </button>
                    <button onClick={() => openLightbox(img)} className="flex items-center gap-1.5 text-slate-500 hover:text-blue-500 transition text-sm font-medium">
                      <MessageCircle className="w-4 h-4" /> {img.commentsCount || 0}
                    </button>
                  </div>
                  {user && (profile?.userId === img.authorId || user.uid === img.authorId || profile?.role === 'admin') && (
                    <button onClick={() => handleDelete(img.id!)} className="text-slate-400 hover:text-red-600 transition p-1 rounded-md hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-0 md:p-6 backdrop-blur-sm"
          >
            <button onClick={() => setLightboxImage(null)} className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 rounded-full text-white p-2 transition backdrop-blur-md">
              <X className="w-6 h-6" />
            </button>
            
            <div className="w-full h-full md:h-auto max-w-6xl flex flex-col md:flex-row bg-slate-900 rounded-none md:rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="flex-1 bg-black flex items-center justify-center h-[50vh] md:h-[80vh]">
                <img src={lightboxImage.imageUrl || lightboxImage.imageBase64} alt={lightboxImage.caption} className="max-h-full max-w-full object-contain" />
              </div>
              
              <div className="w-full md:w-[400px] flex flex-col h-[50vh] md:h-[80vh] bg-white text-slate-900">
                <div className="p-6 border-b border-slate-100 shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900 text-lg">{lightboxImage.authorName}</h3>
                    <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{lightboxImage.authorMatricNumber}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">{lightboxImage.createdAt ? formatDistanceToNow(lightboxImage.createdAt.toDate(), { addSuffix: true }) : ''}</p>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => toggleLike(lightboxImage.id!)}
                      disabled={!user}
                      className="flex items-center gap-2 text-slate-600 hover:text-red-500 transition font-medium"
                    >
                      <Heart className="w-5 h-5" /> {lightboxImage.likes} Likes
                    </button>
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <Eye className="w-5 h-5" /> {lightboxImage.views || 0} Views
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                  <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Comments ({comments.length})
                  </h4>
                  {comments.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">No comments yet. Be the first to comment!</p>
                  ) : (
                    <div className="space-y-4">
                      {comments.map(c => (
                        <div key={c.id} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                          <p className="font-semibold text-sm text-slate-900 mb-1">{c.authorName}</p>
                          <p className="text-slate-700 text-sm">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {user && (
                  <form onSubmit={handleAddComment} className="p-4 border-t border-slate-200 bg-white shrink-0 flex gap-2">
                    <input 
                      type="text" 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                    <button type="submit" disabled={!newComment.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition text-sm">
                      Post
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} profile={profile} user={user} />
    </div>
  );
}

function UploadModal({ isOpen, onClose, profile, user }: { isOpen: boolean; onClose: () => void, profile: any, user: any }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    // Generate object URLs for previews
    const objectUrls = files.map(file => URL.createObjectURL(file));
    setPreviews(objectUrls);
    
    // Free memory when unmounted or files change
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => {
      const newFiles = [...prev, ...acceptedFiles];
      if (newFiles.length > MAX_FILES) {
        toast.error(`You can only upload a maximum of ${MAX_FILES} photos at once.`);
        return newFiles.slice(0, MAX_FILES);
      }
      return newFiles;
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxSize: MAX_FILE_SIZE,
    disabled: uploading,
    onDropRejected: (fileRejections: any[]) => {
      fileRejections.forEach((file) => {
        if (file.errors[0].code === 'file-too-large') {
          toast.error(`${file.file.name} exceeds the 10MB limit.`);
        } else {
          toast.error(`${file.file.name} is not a supported format.`);
        }
      });
    }
  } as any);

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!profile || files.length === 0) return;
    setUploading(true);
    setProgress(0);

    let completed = 0;
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const storageRef = ref(storage, `classGallery/${profile?.userId || user.uid}/${fileName}`);
        
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            () => {},
            (error) => reject(error),
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                await addDoc(collection(db, 'classGallery'), {
                  authorId: profile?.userId || user.uid,
                  authorName: profile?.fullName || user.email?.split('@')[0] || 'Unknown User',
                  authorMatricNumber: profile?.matricNumber || '',
                  imageUrl: downloadURL,
                  caption: '',
                  likes: 0,
                  views: 0,
                  commentsCount: 0,
                  createdAt: serverTimestamp(),
                });
                completed++;
                setProgress(Math.round((completed / files.length) * 100));
                resolve(null);
              } catch (e) {
                reject(e);
              }
            }
          );
        });
      }
      toast.success('Photos uploaded successfully!');
      setFiles([]);
      onClose();
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Failed to upload some photos.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h2 className="text-xl font-bold text-slate-800">Upload Graduation Photos</h2>
          <button onClick={onClose} disabled={uploading} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium text-slate-800 mb-2">Drag & drop your photos here</p>
            <p className="text-slate-500 mb-6">or click to browse from your device</p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
              <span>JPG, PNG, WebP</span>
              <span>•</span>
              <span>Max {MAX_FILES} photos</span>
              <span>•</span>
              <span>Up to 10MB each</span>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-slate-800 mb-4">Selected Photos ({files.length}/{MAX_FILES})</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    {!uploading && (
                      <button 
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
          {uploading && (
            <div className="mb-4">
              <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                <span>Uploading {files.length} photos...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose} 
              disabled={uploading}
              className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {uploading ? 'Uploading...' : 'Upload Photos'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
