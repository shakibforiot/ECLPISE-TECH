import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, database } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile as firebaseUpdateProfile, User as FirebaseUser } from 'firebase/auth';
import { ref, set, onValue, update } from 'firebase/database';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let detachUserProfile: (() => void) | undefined;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      detachUserProfile?.();
      detachUserProfile = undefined;
      if (firebaseUser) {
        const userRef = ref(database, `users/${firebaseUser.uid}`);
        detachUserProfile = onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if (userData) {
            setCurrentUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: userData.displayName || firebaseUser.displayName,
              photoURL: userData.photoURL || firebaseUser.photoURL,
              role: userData.role || 'user',
              createdAt: userData.createdAt || new Date().toISOString(),
              balance: Number.isFinite(Number(userData.balance)) ? Number(userData.balance) : 25.5,
            });
            if (!Number.isFinite(Number(userData.balance))) {
              update(userRef, { balance: 25.5 });
            }
          } else {
            const newUser = {
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              role: 'user' as const,
              createdAt: new Date().toISOString(),
              balance: 25.5,
            };
            set(userRef, newUser);
            setCurrentUser({ id: firebaseUser.uid, ...newUser });
          }
          setLoading(false);
        });
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });
    return () => {
      detachUserProfile?.();
      unsubscribe();
    };
  }, []);

  const signup = async (email: string, password: string, displayName?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await set(ref(database, `users/${user.uid}`), {
      email: user.email,
      displayName: displayName || '',
      photoURL: '',
      role: 'user',
      createdAt: new Date().toISOString(),
      balance: 25.5,
    });
    
    if (displayName) {
      await firebaseUpdateProfile(user, { displayName });
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    
    const updates: Record<string, any> = {};
    if (data.displayName !== undefined) updates.displayName = data.displayName;
    if (data.photoURL !== undefined) updates.photoURL = data.photoURL;
    if (data.role !== undefined) updates.role = data.role;
    if (data.balance !== undefined) updates.balance = data.balance;

    if (auth.currentUser && (data.displayName !== undefined || data.photoURL !== undefined)) {
      await firebaseUpdateProfile(auth.currentUser, {
        ...(data.displayName !== undefined ? { displayName: data.displayName } : {}),
        ...(data.photoURL !== undefined ? { photoURL: data.photoURL } : {}),
      });
    }
    
    await update(ref(database, `users/${currentUser.id}`), updates);
    
    setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}