import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  User 
} from 'firebase/auth';
import { auth } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const googleProvider = new GoogleAuthProvider();

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