import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  userId: string;
  fullName: string;
  matricNumber: string;
  telephoneNumber: string;
  email: string;
  location: string;
  programme: string;
  graduationYear: string;
  passportBase64: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  role: 'student' | 'admin';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserImages {
  userId: string;
  images: string[];
}

export interface MemoryPost {
  id?: string;
  authorId: string;
  authorName: string;
  authorPassport: string;
  type: 'message' | 'quote' | 'memory' | 'photo';
  content: string;
  imageBase64?: string;
  likes: number;
  likedBy: string[];
  createdAt: Timestamp;
}

export interface ClassGalleryImage {
  id?: string;
  authorId: string;
  authorName: string;
  authorMatricNumber?: string;
  imageBase64?: string;
  imageUrl?: string;
  caption: string;
  likes: number;
  views: number;
  commentsCount?: number;
  createdAt: Timestamp;
}
