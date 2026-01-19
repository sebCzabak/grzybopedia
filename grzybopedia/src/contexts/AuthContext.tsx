import { createContext, useState, useEffect, useContext, type ReactNode, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance'; 
import { type UserProfile } from '../types';
import { Box, CircularProgress, Typography } from '@mui/material';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean; 
  token: string | null; 
  refetchUser: (silent?: boolean) => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token')); 
  const [isLoading, setIsLoading] = useState(true); 


  const refetchUser = useCallback(async (silent: boolean = false) => {
    if (!token) { 
      setIsLoading(false);
      setUser(null); 
      return;
    }
    
    // Jeśli nie jest silent, pokaż loader (tylko przy pierwszym ładowaniu)
    if (!silent) {
      setIsLoading(true);
    }
    
    try {
      const response = await axiosInstance.get('/users/me');
      console.log('Dane użytkownika z /users/me:', response.data);
      console.log('Znalezionych grzybów:', response.data?.mushroomsFound);
      console.log('Odznaki:', response.data?.badges?.length || 0);
      setUser(response.data);
    } catch (error: any) {
      console.error("Błąd podczas pobierania profilu użytkownika:", error);
      console.error("Status:", error.response?.status);
      console.error("Response data:", error.response?.data);

      // Jeśli błąd 401, wyloguj użytkownika
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [token]); 


  useEffect(() => {
    refetchUser(); 
  }, [refetchUser]); 

  const login = useCallback(async (newToken: string) => {
    localStorage.setItem('token', newToken); 
    setToken(newToken); 
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axiosInstance.defaults.headers.common['Authorization'];
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, isLoading, token, refetchUser }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress size={60} />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Ładowanie...
          </Typography>
        </Box>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};