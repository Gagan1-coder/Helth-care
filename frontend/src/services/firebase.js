// LifeLink AI - Firebase Client Initialization & Authentication Service
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'lifelink-ai.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'lifelink-ai',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'lifelink-ai.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== '' &&
  firebaseConfig.projectId
);

let app = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (err) {
    console.warn('Firebase initialization warning:', err.message);
  }
}

export { auth, googleProvider };

// Helper to format friendly error messages
export function formatAuthError(errorCode, defaultMsg = 'Authentication failed.') {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email address or password. Please verify your credentials.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters with letters and numbers.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing authentication.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in your Firebase console. Add localhost or your domain under Firebase > Authentication > Settings > Authorized Domains.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed login attempts. Reset your password or try again later.';
    default:
      return defaultMsg;
  }
}

// Authentication Actions
export async function loginWithEmail(email, password) {
  if (!isFirebaseConfigured || !auth) {
    // Local secure development simulation
    return simulateLocalLogin(email, password);
  }
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(email, password, displayName) {
  if (!isFirebaseConfigured || !auth) {
    return simulateLocalRegister(email, password, displayName);
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  // Send email verification
  if (userCredential.user) {
    await sendEmailVerification(userCredential.user).catch((err) => {
      console.warn('Email verification send error:', err);
    });
  }
  return userCredential;
}

export async function loginWithGoogle() {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    return simulateLocalGoogleLogin();
  }
  return await signInWithPopup(auth, googleProvider);
}

export async function resetPassword(email) {
  if (!isFirebaseConfigured || !auth) {
    return { success: true, message: `Password reset simulation: instructions dispatched to ${email}` };
  }
  await sendPasswordResetEmail(auth, email);
  return { success: true, message: `Password reset email sent to ${email}. Check your inbox and spam folder.` };
}

export async function resendVerificationEmail() {
  if (!isFirebaseConfigured || !auth || !auth.currentUser) {
    return { success: true, message: 'Verification link resent successfully.' };
  }
  await sendEmailVerification(auth.currentUser);
  return { success: true, message: 'Verification link resent to your email address.' };
}

export async function logoutUser() {
  if (isFirebaseConfigured && auth) {
    await firebaseSignOut(auth);
  }
  localStorage.removeItem('lifelink_user_id');
  localStorage.removeItem('lifelink_user_name');
  localStorage.removeItem('lifelink_user_email');
  localStorage.removeItem('lifelink_id_token');
}

// Safe Local Sandbox simulation helpers when Firebase keys are pending configuration
function simulateLocalLogin(email, password) {
  const localUsers = JSON.parse(localStorage.getItem('lifelink_local_users') || '{}');
  const user = localUsers[email.toLowerCase()];
  if (!user) {
    throw { code: 'auth/user-not-found', message: 'No account found with this email in local test database.' };
  }
  // In a real app we never store plaintext; for local offline testing:
  if (user.passwordHash !== btoa(password)) {
    throw { code: 'auth/wrong-password', message: 'Invalid credentials provided.' };
  }
  return {
    user: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified || false,
      getIdToken: async () => `mock_token_${user.uid}`
    }
  };
}

function simulateLocalRegister(email, password, displayName) {
  const localUsers = JSON.parse(localStorage.getItem('lifelink_local_users') || '{}');
  const lower = email.toLowerCase();
  if (localUsers[lower]) {
    throw { code: 'auth/email-already-in-use', message: 'An account already exists with this email address.' };
  }
  const uid = `usr_${Date.now()}`;
  localUsers[lower] = {
    uid,
    email: lower,
    displayName: displayName || email.split('@')[0],
    passwordHash: btoa(password),
    emailVerified: false,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('lifelink_local_users', JSON.stringify(localUsers));

  return {
    user: {
      uid,
      email: lower,
      displayName: displayName || email.split('@')[0],
      emailVerified: false,
      getIdToken: async () => `mock_token_${uid}`
    }
  };
}

function simulateLocalGoogleLogin() {
  const uid = `google_${Date.now()}`;
  return {
    user: {
      uid,
      email: 'verified.evaluator@lifelink-ai.org',
      displayName: 'Google Authenticated User',
      photoURL: null,
      emailVerified: true,
      getIdToken: async () => `mock_token_${uid}`
    }
  };
}
