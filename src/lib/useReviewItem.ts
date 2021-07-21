import React from 'react';

import firebase, { useCollection } from '@/firebase/client';
import { useUser } from '@/context/userContext';
import { Item } from '@/lib/Item';

export function useReviewItem(updatePeriod?: number) {
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    const updateNow = () => setNow(new Date());
    updateNow();

    if (updatePeriod) {
      const id = setInterval(updateNow, 5000);
      return () => clearInterval(id);
    }
  }, [updatePeriod]);

  const { user, isLoading: isUserLoading } = useUser();

  const query = React.useMemo(
    () =>
      now &&
      user &&
      (firebase
        .firestore()
        .collection(`users/${user.uid}/items`)
        .where('scheduledOn', '<', now)
        .orderBy('scheduledOn')
        .limit(1) as firebase.firestore.Query<Item>),
    [user, now]
  );

  const reviewQueue = useCollection(query, { showStale: true });

  return {
    isLoading: isUserLoading || !reviewQueue,
    item: reviewQueue?.docs[0],
  };
}
