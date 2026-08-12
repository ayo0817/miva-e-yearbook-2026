import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { MemoryPost } from '../types';
import { fileToBase64, compressImage } from '../lib/utils';
import { MessageSquare, Heart, Image as ImageIcon, Trash2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function MemoryWall() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<MemoryPost[]>([]);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postType, setPostType] = useState<'message' | 'quote' | 'memory' | 'photo'>('message');

  useEffect(() => {
    const q = query(collection(db, 'memoryWall'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MemoryPost[];
      setPosts(fetchedPosts);
    });
    return () => unsubscribe();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setPostType('photo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!content.trim() && !imageFile)) return;

    setIsSubmitting(true);
    try {
      let imageBase64 = '';
      if (imageFile) {
        const rawBase64 = await fileToBase64(imageFile);
        imageBase64 = await compressImage(rawBase64, 800, 800, 0.8);
      }

      const authorId = profile?.userId || user.uid;
      const authorName = profile?.fullName || user.email?.split('@')[0] || 'Unknown User';
      const authorPassport = profile?.passportBase64 || `https://ui-avatars.com/api/?name=${user.email || 'User'}&background=random`;

      const newPostRef = doc(collection(db, 'memoryWall'));
      await setDoc(newPostRef, {
        authorId,
        authorName,
        authorPassport,
        type: imageBase64 ? 'photo' : postType,
        content: content.trim(),
        imageBase64,
        likes: 0,
        likedBy: [],
        createdAt: serverTimestamp(),
      });

      setContent('');
      setImageFile(null);
      setImagePreview(null);
      setPostType('message');
    } catch (error) {
      console.error('Error posting memory', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = async (postId: string, likedBy: string[]) => {
    if (!user) return;
    const isLiked = likedBy.includes(user.uid);
    const postRef = doc(db, 'memoryWall', postId);
    
    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likedBy: arrayRemove(user.uid),
          likes: likedBy.length - 1
        });
      } else {
        await updateDoc(postRef, {
          likedBy: arrayUnion(user.uid),
          likes: likedBy.length + 1
        });
      }
    } catch (error) {
      console.error("Error toggling like", error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this memory?")) {
      try {
        await deleteDoc(doc(db, 'memoryWall', postId));
      } catch (error) {
        console.error("Error deleting post", error);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Memory Wall</h1>
        <p className="text-lg text-slate-600">Share your graduation joy, memories, and well wishes with the class.</p>
      </div>

      {user ? (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <img src={profile?.passportBase64 || `https://ui-avatars.com/api/?name=${user.email || 'User'}&background=random`} alt="You" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
              <div className="flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share a memory, quote, or congratulatory message..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  rows={3}
                />
                
                {imagePreview && (
                  <div className="relative mt-4 inline-block">
                    <img src={imagePreview} alt="Preview" className="max-h-64 rounded-xl border border-slate-200" />
                    <button 
                      type="button" 
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pl-16">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:inline">Add Photo</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                
                <select 
                  value={postType} 
                  onChange={(e) => setPostType(e.target.value as any)}
                  className="p-2 text-sm text-slate-600 bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-slate-50 rounded-xl"
                  disabled={!!imageFile}
                >
                  <option value="message">Message</option>
                  <option value="quote">Quote</option>
                  <option value="memory">Memory</option>
                  {imageFile && <option value="photo">Photo</option>}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (!content.trim() && !imageFile)}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSubmitting ? 'Posting...' : <><Send className="w-4 h-4" /> Post</>}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl text-center mb-10">
          <p className="text-blue-800 font-medium mb-4">Please log in to post on the Memory Wall.</p>
        </div>
      )}

      <div className="space-y-6">
        <AnimatePresence>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <img src={post.authorPassport} alt={post.authorName} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                  <div>
                    <h3 className="font-bold text-slate-900">{post.authorName}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="capitalize px-2 py-0.5 bg-slate-100 rounded-md font-medium">{post.type}</span>
                      <span>•</span>
                      <span>{post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now'}</span>
                    </div>
                  </div>
                </div>
                {user && (profile?.userId === post.authorId || user.uid === post.authorId || profile?.role === 'admin') && (
                  <button onClick={() => handleDelete(post.id!)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {post.type === 'quote' ? (
                <blockquote className="border-l-4 border-yellow-400 pl-4 py-2 italic text-lg text-slate-700 my-4">
                  "{post.content}"
                </blockquote>
              ) : (
                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
              )}

              {post.imageBase64 && (
                <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200">
                  <img src={post.imageBase64} alt="Post attachment" className="w-full max-h-96 object-cover" />
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-6">
                <button 
                  onClick={() => toggleLike(post.id!, post.likedBy || [])}
                  disabled={!user}
                  className={`flex items-center gap-2 group transition ${!user && 'opacity-50 cursor-not-allowed'}`}
                >
                  <div className={`p-2 rounded-full transition ${post.likedBy?.includes(user?.uid || '') ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500 group-hover:bg-red-50 group-hover:text-red-500'}`}>
                    <Heart className={`w-5 h-5 ${post.likedBy?.includes(user?.uid || '') ? 'fill-current' : ''}`} />
                  </div>
                  <span className={`font-medium ${post.likedBy?.includes(user?.uid || '') ? 'text-red-600' : 'text-slate-600'}`}>{post.likes || 0}</span>
                </button>
                {/* Comments can be implemented similarly if needed, keeping simple for now */}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}