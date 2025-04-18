'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie'; // Client-side cookie reader

type AuthContextType = {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
  isHydrated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const cookieToken = Cookies.get('token');
    console.log('Cookie token:', cookieToken);
    if (cookieToken) {
      setTokenState(cookieToken);
    }
    setIsHydrated(true);
    
  }, []);

  const setToken = (token: string) => {
    Cookies.set('token', token, {
      expires: 1, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Strict',
    });
    setTokenState(token);
  };

  const logout = () => {
    Cookies.remove('token');
    setTokenState(null);
  };

  return (
    <AuthContext.Provider value={{ token, setToken, logout, isHydrated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
