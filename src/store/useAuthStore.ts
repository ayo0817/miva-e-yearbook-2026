import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  matricNumber: string;
  phone: string;
  location: string;
  programme: string;
  graduationYear: string;
  passportUrl: string;
  gallery: string[];
  role: 'student' | 'admin';
  createdAt: number;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
}));
