import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  PhoneAuthProvider,
  linkWithCredential,
  User 
} from 'firebase/auth';
import { auth } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const googleProvider = new GoogleAuthProvider();

// Phone auth support
let recaptchaVerifier: RecaptchaVerifier | null = null;

export const initializeRecaptcha = (elementId: string): RecaptchaVerifier => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
  }
  
  recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
    }
  });
  
  return recaptchaVerifier;
};

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('User signed in:', result.user.displayName);
    
    // Save user info to Firestore
    await saveUserToFirestore(result.user);
    
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('User signed in with email:', result.user.email);
    
    // Check if email is verified
    if (!result.user.emailVerified) {
      throw new Error('Please verify your email before signing in. Check your inbox for a verification link.');
    }
    
    return result.user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string, fullName?: string): Promise<User | null> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with full name
    if (fullName) {
      await updateProfile(result.user, {
        displayName: fullName
      });
    }
    
    // Send email verification
    await sendEmailVerification(result.user);
    
    // Save user info to Firestore
    await saveUserToFirestore(result.user);
    
    console.log('User created:', result.user.email);
    return result.user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

const saveUserToFirestore = async (user: User) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
        emailVerified: user.emailVerified,
      });
    }
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('User signed out');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };

export const sendPhoneVerification = async (phoneNumber: string, recaptcha: RecaptchaVerifier): Promise<ConfirmationResult> => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptcha);
    return confirmationResult;
  } catch (error) {
    console.error('Error sending phone verification:', error);
    throw error;
  }
};

export const verifyPhoneCode = async (confirmationResult: ConfirmationResult, code: string): Promise<User | null> => {
  try {
    const result = await confirmationResult.confirm(code);
    console.log('Phone verification successful:', result.user.phoneNumber);
    
    // Save user info to Firestore
    await saveUserToFirestore(result.user);
    
    return result.user;
  } catch (error) {
    console.error('Error verifying phone code:', error);
    throw error;
  }
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Friendly error messages
export const getFriendlyErrorMessage = (error: any): string => {
  const errorCode = error?.code || '';
  const errorMessage = error?.message || '';
  
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Looks like something\'s off. Email or password might be incorrect.';
    
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    
    case 'auth/weak-password':
      return 'Please choose a stronger password (at least 6 characters).';
    
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    
    case 'auth/invalid-phone-number':
      return 'Please enter a valid phone number.';
    
    case 'auth/invalid-verification-code':
      return 'Invalid verification code. Please try again.';
    
    case 'auth/code-expired':
      return 'Verification code has expired. Please request a new one.';
    
    case 'auth/missing-phone-number':
      return 'Please enter your phone number.';
    
    default:
      // Check for specific error messages
      if (errorMessage.includes('email')) {
        return 'Please verify your email before signing in. Check your inbox for a verification link.';
      }
      
      return 'Something went wrong. Please try again or contact support if the problem persists.';
  }
};