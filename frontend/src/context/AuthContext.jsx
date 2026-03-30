import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser({ ...res.data, token });
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data);
      return { success: true };
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
        // User exists but not verified
        setUser({ email: error.response.data.email, requiresVerification: true });
        return { success: false, requiresVerification: true, email: error.response.data.email };
      }
      throw error;
    }
  };

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    // Don't set token yet, wait for verification
    setUser({ ...res.data, requiresVerification: true });
    return { success: true };
  };

  const verifyOtp = async (email, otp) => {
    try {
      const res = await api.post('/auth/verify-email', { email, otp });
      localStorage.setItem('token', res.data.token);
      setUser(res.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Verification failed' };
    }
  };

  const resendOtp = async (email) => {
    try {
      await api.post('/auth/resend-otp', { email });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to resend' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, verifyOtp, resendOtp, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
