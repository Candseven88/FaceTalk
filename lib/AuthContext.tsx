'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Define the user type
export interface User {
  name: string;
  email: string;
  userId: string;
  isAuthenticated: boolean;
  plan: string;
  nextBilling: string;
  credits: {
    total: number;
    used: number;
    remaining: number;
  };
  recentGenerations: Array<{
    id: string;
    type: string;
    name: string;
    date: string;
    fileSize: string;
    status: string;
    thumbnail: string;
  }>;
  activeProcesses: Array<{
    id: string;
    type: string;
    name: string;
    progress: number;
    startedAt: string;
  }>;
}

// Define the context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('facetalk_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Check if the user is authenticated for protected routes
  useEffect(() => {
    if (!loading) {
      const protectedRoutes = ['/dashboard'];
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
      
      if (isProtectedRoute && !user) {
        router.push('/get-started');
      }
    }
  }, [user, loading, pathname, router]);

  // Register a new user
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new user object
      const newUser: User = {
        name,
        email,
        userId: `user_${Math.random().toString(36).substr(2, 9)}`,
        isAuthenticated: true,
        plan: 'Free Trial',
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        credits: {
          total: 10,
          used: 0,
          remaining: 10
        },
        recentGenerations: [],
        activeProcesses: []
      };
      
      // Save user to localStorage
      localStorage.setItem('facetalk_user', JSON.stringify(newUser));
      setUser(newUser);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Login a user
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data for demo
      const loggedInUser: User = {
        name: 'Creative Creator',
        email,
        userId: `user_${Math.random().toString(36).substr(2, 9)}`,
        isAuthenticated: true,
        plan: 'Pro Plan',
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        credits: {
          total: 50,
          used: 8,
          remaining: 42
        },
        recentGenerations: [
          {
            id: 'gen_1',
            type: 'Talking Avatar',
            name: 'Business Presentation',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            fileSize: '15.2 MB',
            status: 'completed',
            thumbnail: '/thumbnails/avatar-1.jpg'
          },
          {
            id: 'gen_2',
            type: 'Voice Clone',
            name: 'Marketing Script',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            fileSize: '3.8 MB',
            status: 'completed',
            thumbnail: '/thumbnails/voice-1.jpg'
          },
          {
            id: 'gen_3',
            type: 'Live Portrait',
            name: 'CEO Announcement',
            date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            fileSize: '8.1 MB',
            status: 'processing',
            thumbnail: '/thumbnails/portrait-1.jpg'
          }
        ],
        activeProcesses: [
          {
            id: 'proc_1',
            type: 'Live Portrait',
            name: 'Team Introduction',
            progress: 68,
            startedAt: new Date().toISOString()
          }
        ]
      };
      
      // Save user to localStorage
      localStorage.setItem('facetalk_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Logout a user
  const logout = () => {
    localStorage.removeItem('facetalk_user');
    setUser(null);
    router.push('/');
  };

  // Update user data
  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      localStorage.setItem('facetalk_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 