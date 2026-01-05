
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';

interface UseUser {
  user: User | null;
  loading: boolean;
}

export function useUser(auth: Auth | null): UseUser {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
