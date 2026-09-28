import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  User,
  onAuthStateChanged,
  signOut as fbSignOut,
  sendEmailVerification as fbSendEmailVerification,
  updateProfile as fbUpdateProfile,
  reload as fbReload
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { auth, db, getAuthErrorMessage } from "../firebase";
import { UserProfile } from "../types";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isEmailVerified: boolean;
  resendVerificationEmail: () => Promise<{ success: boolean; message: string }>;
  reloadUser: () => Promise<boolean>;
  signOut: () => Promise<void>;
  updateUserProfileData: (updates: Partial<UserProfile>) => Promise<boolean>;
  allUsers: UserProfile[];
  loadingUsers: boolean;
  refreshUsers: () => Promise<void>;
  updateUserRoleOrStatus: (targetUid: string, updates: Partial<UserProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  // Sync or fetch profile from Firestore with fallback to local profile
  const syncUserProfile = useCallback(async (firebaseUser: User) => {
    const defaultProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
      photoURL: firebaseUser.photoURL || undefined,
      role: "admin", // default first user or local admin
      status: "active",
      emailVerified: firebaseUser.emailVerified,
      createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
      lastLoginAt: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
    };

    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        const updated: UserProfile = {
          ...defaultProfile,
          ...data,
          emailVerified: firebaseUser.emailVerified,
          lastLoginAt: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
        };
        setUserProfile(updated);
        // update lastLogin and verification status in firestore asynchronously
        try {
          await updateDoc(userRef, {
            emailVerified: firebaseUser.emailVerified,
            lastLoginAt: new Date().toISOString(),
            updatedAt: serverTimestamp(),
          });
        } catch {
          // ignore silent firestore write error
        }
      } else {
        // create new user profile document in Firestore
        try {
          await setDoc(userRef, {
            ...defaultProfile,
            createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            updatedAt: serverTimestamp(),
          });
        } catch (e) {
          console.warn("Firestore not available or permission denied, using in-memory profile:", e);
        }
        setUserProfile(defaultProfile);
      }
    } catch (err) {
      console.warn("Could not reach Firestore users collection, using auth fallback:", err);
      setUserProfile(defaultProfile);
    }
  }, []);

  // Fetch all registered users for Screen User Management
  const refreshUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const list: UserProfile[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ uid: docSnap.id, ...(docSnap.data() as any) });
      });

      if (list.length > 0) {
        setAllUsers(list);
      } else if (user) {
        // If firestore is empty, add current user
        setAllUsers([
          userProfile || {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || user.email?.split("@")[0] || "User",
            role: "admin",
            status: "active",
            emailVerified: user.emailVerified,
            createdAt: user.metadata.creationTime || new Date().toISOString(),
            lastLoginAt: user.metadata.lastSignInTime || new Date().toISOString(),
          }
        ]);
      }
    } catch (err) {
      console.warn("Could not list firestore users, falling back to local list:", err);
      if (user) {
        setAllUsers([
          userProfile || {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || user.email?.split("@")[0] || "User",
            role: "admin",
            status: "active",
            emailVerified: user.emailVerified,
            createdAt: user.metadata.creationTime || new Date().toISOString(),
            lastLoginAt: user.metadata.lastSignInTime || new Date().toISOString(),
          }
        ]);
      }
    } finally {
      setLoadingUsers(false);
    }
  }, [user, userProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        setUserProfile(null);
        setAllUsers([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncUserProfile]);

  // Reload user auth state (critical after verifying email via link)
  const reloadUser = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    try {
      await fbReload(auth.currentUser);
      const refreshedUser = auth.currentUser;
      setUser({ ...refreshedUser } as User);
      if (refreshedUser) {
        await syncUserProfile(refreshedUser);
      }
      return refreshedUser.emailVerified;
    } catch (err) {
      console.error("Failed to reload user", err);
      return false;
    }
  };

  // Resend email verification
  const resendVerificationEmail = async (): Promise<{ success: boolean; message: string }> => {
    if (!auth.currentUser) {
      return { success: false, message: "No active user session found. Please log in." };
    }
    if (auth.currentUser.emailVerified) {
      return { success: true, message: "Your email address is already verified!" };
    }

    try {
      await fbSendEmailVerification(auth.currentUser);
      return {
        success: true,
        message: `Verification email sent successfully to ${auth.currentUser.email}. Please check your inbox and spam folder.`
      };
    } catch (err: any) {
      return {
        success: false,
        message: getAuthErrorMessage(err)
      };
    }
  };

  // Sign out
  const signOut = async () => {
    await fbSignOut(auth);
    setUser(null);
    setUserProfile(null);
    setAllUsers([]);
  };

  // Update current user profile
  const updateUserProfileData = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!auth.currentUser) return false;

    try {
      // update firebase auth profile if displayName or photoURL changed
      if (updates.displayName !== undefined || updates.photoURL !== undefined) {
        await fbUpdateProfile(auth.currentUser, {
          displayName: updates.displayName ?? auth.currentUser.displayName,
          photoURL: updates.photoURL ?? auth.currentUser.photoURL,
        });
      }

      // update Firestore document
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.warn("Could not save to firestore, updating state directly:", e);
      }

      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
      setUser({ ...auth.currentUser } as User);
      return true;
    } catch (err) {
      console.error("Error updating profile:", err);
      return false;
    }
  };

  // Update target user's role or status (for screen user management directory)
  const updateUserRoleOrStatus = async (targetUid: string, updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      try {
        const userRef = doc(db, "users", targetUid);
        await updateDoc(userRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.warn("Could not update target user in Firestore:", e);
      }

      setAllUsers((prev) =>
        prev.map((u) => (u.uid === targetUid ? { ...u, ...updates } : u))
      );
      if (userProfile && userProfile.uid === targetUid) {
        setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
      }
      return true;
    } catch (err) {
      console.error("Error updating user:", err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isEmailVerified: !!user?.emailVerified,
        resendVerificationEmail,
        reloadUser,
        signOut,
        updateUserProfileData,
        allUsers,
        loadingUsers,
        refreshUsers,
        updateUserRoleOrStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
