import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Set auth header for all future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Validate token and get user data
          const response = await axios.get('/api/auth/me');
          setCurrentUser(response.data);
        }
      } catch (error) {
        // Clear invalid token
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      const { token, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update user state
      setCurrentUser(user);
      
      return true;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // Remove token
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear user state
    setCurrentUser(null);
  };

  const isAdmin = () => {
    return currentUser && currentUser.role === 'admin';
  };

  // Context value
  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 