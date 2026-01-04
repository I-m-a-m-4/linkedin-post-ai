'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentReference, DocumentData } from 'firebase/firestore';
import { useFirestore } from '../provider';

interface UseDoc<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useDoc<T extends DocumentData>(pathOrRef: string | DocumentReference): UseDoc<T> {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore) return;

    const docRef = typeof pathOrRef === 'string' ? doc(firestore, pathOrRef) : pathOrRef;

    const unsubscribe = onSnapshot(docRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching document:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, pathOrRef]);

  return { data, loading, error };
}
