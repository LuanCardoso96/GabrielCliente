// Authentication Context for managing user state
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange, getCurrentUser, isAdmin as checkIsAdmin } from '../firebase/auth.js';
import { User } from '../api/entities.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Get user profile from Firestore
          const profile = await User.getById(user.uid);
          setUserProfile(profile);
          
          // Check if user is admin
          const adminStatus = await checkIsAdmin(user);
          console.log('User email:', user.email, 'Admin status:', adminStatus);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
          // Even if there's an error, check admin status by email
          const adminStatus = user.email === 'dsconstrucoesdev@gmail.com';
          console.log('Error occurred, checking admin by email:', user.email, 'Admin status:', adminStatus);
          setIsAdmin(adminStatus);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    isAdmin,
    setUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
