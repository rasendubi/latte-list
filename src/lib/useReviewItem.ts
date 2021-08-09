import React from 'react';

import firebase, { useCollection } from '@/firebase/client';
import { useUser } from '@/context/userContext';
import { Item } from '@/lib/Item';
import { useNow } from '@/lib/useNow';

export function useReviewItem(updatePeriod?: number) {
  // TODO: optimize me! we know exactly when the next item becomes
  // ready for review—schedule the timer at that time instead of
  // updating it every second.
  const now = useNow(updatePeriod);

  const { user, isLoading: isUserLoading } = useUser();

  const query = React.useMemo(
    () =>
      user &&
      (firebase
        .firestore()
        .collection(`users/${user.uid}/items`)
        .where('scheduledOn', '!=', null)
        .orderBy('scheduledOn')
        // preload at least a couple of items so that review dialog
        // does not close after reviewing the first item
        .limit(3) as firebase.firestore.Query<Item>),
    [user]
  );

  const reviewQueue = useCollection(query, { showStale: true });

  const isLoading = isUserLoading || !reviewQueue;
  const item = reviewQueue?.docs.filter((d) => {
    const scheduledOn = d.data().scheduledOn;
    return scheduledOn && scheduledOn.toDate().getTime() < now.getTime();
  })[0];

  const nextReview = reviewQueue?.docs[0]?.data().scheduledOn?.toDate();

  return {
    isLoading,
    item,
    nextReview,
    now,
  };
}
