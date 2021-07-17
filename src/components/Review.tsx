import React from 'react';

import { useUser } from '@/context/userContext';
import firebase, { useCollection, useCollectionData } from '@/firebase/client';
import { schedule } from '@/lib/scheduling';
import { Item } from '@/lib/Item';

export interface ReviewProps {}

const Review = ({}: ReviewProps) => {
  const { user } = useUser();

  const collectionRef = React.useMemo(
    () =>
      user &&
      (firebase
        .firestore()
        .collection(`users/${user.uid}/items`)
        // .where('scheduledOn', '<', time)
        .orderBy('scheduledOn') as firebase.firestore.Query<Item>),
    [user?.uid]
  );
  const items = useCollection(collectionRef);

  console.log(items?.docs.map((d) => d.data()));

  return (
    <div>
      {items &&
        items.docs.map((doc) => {
          const i = doc.data();
          return (
            <div
              style={{
                border: `1px solid ${
                  i.scheduledOn.toMillis() < Date.now() ? '#0e0' : '#eee'
                }`,
                backgroundColor:
                  i.scheduledOn.toMillis() < Date.now() ? '#efe' : '#fff',
              }}
            >
              <h2>{i.title}</h2>
              <div>
                {i.minutes}
                {'min'}
              </div>
              <div>{JSON.stringify(i.spacingParams, null, 2)}</div>
              <div>
                {'Scheduled on: '}
                {i.scheduledOn.toDate().toString()}
              </div>
              <button onClick={() => schedule(doc.ref)}>{'Later'}</button>
            </div>
          );
        })}
    </div>
  );
};

export default Review;
