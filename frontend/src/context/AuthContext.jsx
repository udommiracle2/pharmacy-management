import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('pharmacy_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pharmacy_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.data);
        localStorage.setItem('pharmacy_user', JSON.stringify(res.data.data));
      })
      .catch(() => {
        localStorage.removeItem('pharmacy_token');
        localStorage.removeItem('pharmacy_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('pharmacy_token', res.data.token);
    localStorage.setItem('pharmacy_user', JSON.stringify(res.data.data));
    setUser(res.data.data);
    return res.data.data;
  };

  const register = async ({ name, email, password }) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('pharmacy_token', res.data.token);
    localStorage.setItem('pharmacy_user', JSON.stringify(res.data.data));
    setUser(res.data.data);
    return res.data.data;
  };

  const logout = () => {
    localStorage.removeItem('pharmacy_token');
    localStorage.removeItem('pharmacy_user');
    setUser(null);
  };

  const deleteAccount = async () => {
    await api.delete('/auth/me');
    localStorage.removeItem('pharmacy_token');
    localStorage.removeItem('pharmacy_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}
