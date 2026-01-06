
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, runTransaction, serverTimestamp, collection } from 'firebase/firestore';

const FREE_CREDITS = 2;

export function useUserCredits(userId: string | undefined) {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const userMetaRef = doc(db, 'user_metadata', userId);
    const unsubscribe = onSnapshot(userMetaRef, (docSnap) => {
      if (docSnap.exists()) {
        setCredits(docSnap.data().credits);
      } else {
        setCredits(FREE_CREDITS);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user credits:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const spendCredit = useCallback(async () => {
    if (!userId) return;

    const userMetaRef = doc(db, 'user_metadata', userId);
    const usageHistoryRef = collection(db, 'user_metadata', userId, 'usage_history');

    try {
      await runTransaction(db, async (transaction) => {
        const userMetaDoc = await transaction.get(userMetaRef);
        let currentCredits = FREE_CREDITS;

        if (userMetaDoc.exists()) {
          currentCredits = userMetaDoc.data().credits;
        }

        const newCredits = Math.max(0, currentCredits - 3);
        
        if (userMetaDoc.exists()) {
          transaction.update(userMetaRef, { credits: newCredits });
        } else {
          transaction.set(userMetaRef, { userId, credits: newCredits, createdAt: serverTimestamp() });
        }
        
        const usageDoc = doc(usageHistoryRef);
        transaction.set(usageDoc, {
          action: 'autoFormat',
          timestamp: serverTimestamp(),
          creditsSpent: 3,
          creditsBefore: currentCredits,
          creditsAfter: newCredits,
        });
      });
    } catch (error) {
      console.error("Transaction failed: ", error);
      throw error;
    }
  }, [userId]);
  
  return { credits, loading, spendCredit };
}
