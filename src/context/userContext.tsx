import React, { useState, useEffect, createContext, useContext } from 'react';

import firebase from '@/firebase/client';

const UserContext = createContext<{ user: User | null; isLoading: boolean }>({
  user: null,
  isLoading: true,
});

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface UserProviderProps {
  children: React.ReactNode;
}

export default function UserProvider({ children }: UserProviderProps) {
  // TODO: do I need to use firebase.auth().currentUser before onAuthStateChanged()?
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(
      async (user) => {
        try {
          if (user) {
            // User is signed in.
            const { uid, displayName, email, photoURL } = user;
            // You could also look for the user doc in your Firestore (if you have one):
            // const userDoc = await firebase.firestore().doc(`users/${uid}`).get()
            setUser({ uid, displayName, email, photoURL });
          } else {
            setUser(null);
          }
        } catch (error) {
          // Most probably a connection error. Handle appropriately.
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
      }
    );

    // Unsubscribe auth listener on unmount
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
