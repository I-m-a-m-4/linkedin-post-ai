'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, runTransaction, serverTimestamp, collection, getDoc, writeBatch, query, orderBy, limit, Timestamp } from 'firebase/firestore';

const FREE_CREDITS = 2;
const FORMAT_COST = 1;
const MONTHLY_GRANT_AMOUNT = 1;
const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

export function useUserCredits(userId: string | undefined) {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setCredits(0);
      return;
    }

    const userMetaRef = doc(db, 'user_metadata', userId);
    const unsubscribe = onSnapshot(userMetaRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let currentCredits = data.credits;

        // Check for monthly grant eligibility
        if (currentCredits === 0) {
          const usageHistoryRef = collection(db, 'user_metadata', userId, 'usage_history');
          const q = query(usageHistoryRef, orderBy('timestamp', 'desc'), limit(1));
          const lastUsageSnap = await getDocs(q);
          
          let grantMonthlyCredit = true;
          if (!lastUsageSnap.empty) {
            const lastUsage = lastUsageSnap.docs[0].data();
            const lastUsageTimestamp = (lastUsage.timestamp as Timestamp).toMillis();
            if (Date.now() - lastUsageTimestamp < THIRTY_DAYS_IN_MS) {
              grantMonthlyCredit = false;
            }
          }

          if (grantMonthlyCredit) {
             const newCredits = MONTHLY_GRANT_AMOUNT;
             const batch = writeBatch(db);
             batch.update(userMetaRef, { credits: newCredits });
             const usageDoc = doc(usageHistoryRef);
             batch.set(usageDoc, {
                action: 'monthly_grant',
                timestamp: serverTimestamp(),
                creditsSpent: -newCredits, // Negative for credit gain
             });
             await batch.commit();
             setCredits(newCredits);
          } else {
             setCredits(currentCredits);
          }
        } else {
          setCredits(currentCredits);
        }
      } else {
        // First-time action for a user, create their metadata with free credits
        setCredits(FREE_CREDITS);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user credits:", error);
      setCredits(FREE_CREDITS); 
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const spendCredit = useCallback(async () => {
    if (!userId) {
        throw new Error("User is not authenticated.");
    }

    const userMetaRef = doc(db, 'user_metadata', userId);
    const usageHistoryRef = collection(db, 'user_metadata', userId, 'usage_history');

    try {
      await runTransaction(db, async (transaction) => {
        const userMetaDoc = await transaction.get(userMetaRef);
        
        let currentCredits;

        if (!userMetaDoc.exists()) {
          const initialData = { 
              userId, 
              credits: FREE_CREDITS, 
              createdAt: serverTimestamp() 
          };
          transaction.set(userMetaRef, initialData);
          currentCredits = FREE_CREDITS;
        } else {
          currentCredits = userMetaDoc.data().credits;
        }

        if (currentCredits >= FORMAT_COST) {
          const newCredits = currentCredits - FORMAT_COST;
          transaction.update(userMetaRef, { credits: newCredits });

          const usageDoc = doc(usageHistoryRef);
          transaction.set(usageDoc, {
            action: 'autoFormat',
            timestamp: serverTimestamp(),
            creditsSpent: FORMAT_COST,
          });
        } else {
          throw new Error("Insufficient credits.");
        }
      });
    } catch (error) {
      console.error("Credit spending transaction failed: ", error);
      throw error;
    }
  }, [userId]);
  
  return { credits, loading, spendCredit };
}
