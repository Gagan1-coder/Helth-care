import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  isFirebaseConfigured,
  loginWithEmail as fbLoginWithEmail,
  registerWithEmail as fbRegisterWithEmail,
  loginWithGoogle as fbLoginWithGoogle,
  resetPassword as fbResetPassword,
  resendVerificationEmail as fbResendVerificationEmail,
  logoutUser as fbLogoutUser,
  formatAuthError
} from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Observe Firebase Auth state
  useEffect(() => {
    let unsubscribe = () => {};

    if (isFirebaseConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const token = await user.getIdToken().catch(() => null);
          if (token) localStorage.setItem('lifelink_id_token', token);
          localStorage.setItem('lifelink_user_id', user.uid);
          localStorage.setItem('lifelink_user_name', user.displayName || user.email);
          localStorage.setItem('lifelink_user_email', user.email);
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
    } else {
      // Restore cached local user if present
      const savedUid = localStorage.getItem('lifelink_user_id');
      const savedEmail = localStorage.getItem('lifelink_user_email');
      const savedName = localStorage.getItem('lifelink_user_name');
      if (savedUid) {
        setCurrentUser({
          uid: savedUid,
          email: savedEmail || `${savedUid}@lifelink-ai.local`,
          displayName: savedName || 'Patient',
          emailVerified: true,
          getIdToken: async () => localStorage.getItem('lifelink_id_token') || `mock_token_${savedUid}`
        });
      }
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const clearMessages = () => {
    setAuthError('');
    setAuthSuccess('');
  };

  const loginWithEmail = async (email, password) => {
    clearMessages();
    setLoading(true);
    try {
      const res = await fbLoginWithEmail(email, password);
      const user = res.user;
      const token = await user.getIdToken();
      localStorage.setItem('lifelink_id_token', token);
      localStorage.setItem('lifelink_user_id', user.uid);
      localStorage.setItem('lifelink_user_name', user.displayName || user.email);
      localStorage.setItem('lifelink_user_email', user.email);
      setCurrentUser(user);
      setLoading(false);
      return user;
    } catch (err) {
      setLoading(false);
      const msg = formatAuthError(err.code, err.message);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const registerWithEmail = async (email, password, displayName) => {
    clearMessages();
    setLoading(true);
    try {
      const res = await fbRegisterWithEmail(email, password, displayName);
      const user = res.user;
      const token = await user.getIdToken();
      localStorage.setItem('lifelink_id_token', token);
      localStorage.setItem('lifelink_user_id', user.uid);
      localStorage.setItem('lifelink_user_name', displayName || user.email);
      localStorage.setItem('lifelink_user_email', user.email);
      setCurrentUser(user);
      setAuthSuccess('Account created successfully! Verification email dispatched.');
      setLoading(false);
      return user;
    } catch (err) {
      setLoading(false);
      const msg = formatAuthError(err.code, err.message);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async () => {
    clearMessages();
    setLoading(true);
    try {
      const res = await fbLoginWithGoogle();
      const user = res.user;
      const token = await user.getIdToken();
      localStorage.setItem('lifelink_id_token', token);
      localStorage.setItem('lifelink_user_id', user.uid);
      localStorage.setItem('lifelink_user_name', user.displayName || user.email);
      localStorage.setItem('lifelink_user_email', user.email);
      setCurrentUser(user);
      setLoading(false);
      return user;
    } catch (err) {
      setLoading(false);
      const msg = formatAuthError(err.code, err.message);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const resetPassword = async (email) => {
    clearMessages();
    setLoading(true);
    try {
      const res = await fbResetPassword(email);
      setAuthSuccess(res.message);
      setLoading(false);
      return res;
    } catch (err) {
      setLoading(false);
      const msg = formatAuthError(err.code, err.message);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const resendVerification = async () => {
    clearMessages();
    try {
      const res = await fbResendVerificationEmail();
      setAuthSuccess(res.message);
      return res;
    } catch (err) {
      const msg = formatAuthError(err.code, err.message);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    clearMessages();
    await fbLogoutUser();
    setCurrentUser(null);
  };

  const setDemoProfile = (profile) => {
    clearMessages();
    const mockToken = `mock_demo_token_${profile.id}`;
    localStorage.setItem('lifelink_id_token', mockToken);
    localStorage.setItem('lifelink_user_id', profile.id);
    localStorage.setItem('lifelink_user_name', profile.name);
    localStorage.setItem('lifelink_user_email', `${profile.id}@lifelink-ai.org`);
    const mockUser = {
      uid: profile.id,
      displayName: profile.name,
      email: `${profile.id}@lifelink-ai.org`,
      emailVerified: true,
      getIdToken: async () => mockToken
    };
    setCurrentUser(mockUser);
    return mockUser;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        authError,
        authSuccess,
        clearMessages,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        resetPassword,
        resendVerification,
        logout,
        setDemoProfile,
        isFirebaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
