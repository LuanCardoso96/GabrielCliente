// Firebase Authentication utilities
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider
} from 'firebase/auth';
import { auth } from './config.js';
import { User } from '../api/entities.js';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Facebook Auth Provider
const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');

// Sign in with email and password
export const signInEmailPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Create user with email and password
export const createUserEmailPassword = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile
    await updateProfile(userCredential.user, {
      displayName: displayName
    });
    
    // Send email verification
    await sendEmailVerification(userCredential.user);
    
    // Create user document in Firestore
    await User.create({
      uid: userCredential.user.uid,
      email: email,
      displayName: displayName,
      role: 'customer', // Default role
      createdAt: new Date(),
      emailVerified: false
    });
    
    return userCredential.user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore, if not create
    const existingUser = await User.getByEmail(user.email);
    if (!existingUser) {
      await User.create({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'customer',
        createdAt: new Date(),
        emailVerified: user.emailVerified
      });
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign in with Facebook
export const signInWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const user = result.user;
    
    // Check if user exists in Firestore, if not create
    const existingUser = await User.getByEmail(user.email);
    if (!existingUser) {
      await User.create({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'customer',
        createdAt: new Date(),
        emailVerified: user.emailVerified
      });
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with Facebook:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Update user profile
export const updateUserProfile = async (updates) => {
  try {
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, updates);
      
      // Update user document in Firestore
      await User.update(user.uid, {
        ...updates,
        updatedAt: new Date()
      });
      
      return user;
    }
    throw new Error('No user is currently signed in');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Check if user is admin
export const isAdmin = async (user) => {
  if (!user) return false;
  
  // Check specific admin email
  if (user.email === 'dsconstrucoesdev@gmail.com') {
    return true;
  }
  
  try {
    const userDoc = await User.getById(user.uid);
    return userDoc?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Get user role
export const getUserRole = async (user) => {
  if (!user) return null;
  
  try {
    const userDoc = await User.getById(user.uid);
    return userDoc?.role || 'customer';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'customer';
  }
};
