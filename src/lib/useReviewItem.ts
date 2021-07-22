import React from 'react';

import firebase, { useCollection } from '@/firebase/client';
import { useUser } from '@/context/userContext';
import { Item } from '@/lib/Item';

export function useReviewItem(updatePeriod?: number) {
  // TODO: optimize me! we know exactly when the next item becomes
  // ready for review—schedule the timer at that time instead of
  // updating it every second.
  const [now, setNow] = React.useState<Date>(new Date());
  React.useEffect(() => {
    const updateNow = () => setNow(new Date());
    updateNow();

    if (updatePeriod) {
      const id = setInterval(updateNow, 1000);
      return () => clearInterval(id);
    }
  }, [updatePeriod]);

  const { user, isLoading: isUserLoading } = useUser();

  const query = React.useMemo(
    () =>
      user &&
      (firebase
        .firestore()
        .collection(`users/${user.uid}/items`)
        .orderBy('scheduledOn')
        .limit(1) as firebase.firestore.Query<Item>),
    [user]
  );

  const reviewQueue = useCollection(query, { showStale: true });

  const isLoading = isUserLoading || !reviewQueue;
  const item = reviewQueue?.docs.filter((d) => {
    const scheduledOn = d.data().scheduledOn;
    return scheduledOn && scheduledOn.toDate().getTime() < now.getTime();
  })[0];

  return {
    isLoading,
    item,
  };
}
