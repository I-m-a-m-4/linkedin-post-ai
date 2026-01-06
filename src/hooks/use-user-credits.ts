
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, runTransaction, serverTimestamp, collection } from 'firebase/firestore';

const FREE_CREDITS = 2;
const FORMAT_COST = 3;

export function useUserCredits(userId: string | undefined) {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setCredits(FREE_CREDITS); // Show default for non-logged-in state
      return;
    }

    const userMetaRef = doc(db, 'user_metadata', userId);
    const unsubscribe = onSnapshot(userMetaRef, (docSnap) => {
      if (docSnap.exists()) {
        setCredits(docSnap.data().credits);
      } else {
        // If the document doesn't exist, the user has the default free credits.
        setCredits(FREE_CREDITS);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user credits:", error);
      // Even on error, show the default free credits so the UI doesn't break.
      // The error indicates a rules problem, but the user effectively has their initial credits.
      setCredits(FREE_CREDITS); 
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const spendCredit = useCallback(async () => {
    if (!userId) {
        console.error("spendCredit called without a userId.");
        throw new Error("User is not authenticated.");
    }

    const userMetaRef = doc(db, 'user_metadata', userId);
    const usageHistoryRef = collection(db, 'user_metadata', userId, 'usage_history');

    try {
      await runTransaction(db, async (transaction) => {
        const userMetaDoc = await transaction.get(userMetaRef);
        
        if (!userMetaDoc.exists()) {
          // This is a new user's first action. Create their doc with initial credits.
          // The security rule will validate that `credits` is exactly `FREE_CREDITS`.
          transaction.set(userMetaRef, { 
              userId, 
              credits: FREE_CREDITS, 
              createdAt: serverTimestamp() 
          });
          // After setting, we will proceed to the update logic outside this if-block.
        }

        // Now, get the latest state of the document within the transaction.
        const freshMetaDoc = await transaction.get(userMetaRef);
        const currentCredits = freshMetaDoc.data()?.credits ?? FREE_CREDITS;

        // Decrement credits
        const newCredits = currentCredits - FORMAT_COST;
        transaction.update(userMetaRef, { credits: newCredits });

        // Always log the usage
        const usageDoc = doc(usageHistoryRef);
        transaction.set(usageDoc, {
          action: 'autoFormat',
          timestamp: serverTimestamp(),
          creditsSpent: FORMAT_COST,
        });
      });
    } catch (error) {
      console.error("Credit spending transaction failed: ", error);
      // Re-throw the error so the calling function knows the transaction failed.
      throw error;
    }
  }, [userId]);
  
  return { credits, loading, spendCredit };
}
