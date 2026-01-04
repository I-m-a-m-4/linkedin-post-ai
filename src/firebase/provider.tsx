'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  firestore: null,
});

interface FirebaseProviderProps {
  children: ReactNode;
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function FirebaseProvider({ children, app, auth, firestore }: FirebaseProviderProps) {
  return (
    <FirebaseContext.Provider value={{ app, auth, firestore }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { app } = useFirebase();
  if (!app) {
    throw new Error('Firebase App not available. Did you forget to wrap your component in a FirebaseProvider?');
  }
  return app;
}

export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  if (!auth) {
    throw new Error('Firebase Auth not available. Did you forget to wrap your component in a FirebaseProvider?');
  }
  return auth;
}

export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  if (!firestore) {
    throw new Error('Firestore not available. Did you forget to wrap your component in a FirebaseProvider?');
  }
  return firestore;
}
