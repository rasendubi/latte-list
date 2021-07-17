import React from 'react';
import firebase, { fetchStats } from '@/firebase/client';
import { useUser } from '@/context/userContext';

import ItemsList from '@/components/ItemsList';
import { schedule } from '@/lib/scheduling';
import { Item } from '@/lib/Item';
import Review from '@/components/Review';

export interface IndexProps {}

const Index = ({}: IndexProps) => {
  const handleClick = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await firebase.auth().signInWithPopup(provider);
    console.log(result);
  };

  const { user } = useUser();

  React.useEffect(() => {
    firebase.functions().httpsCallable;
  }, []);

  const [bookmarks, setBookmarks] = React.useState<any[]>([]);
  React.useEffect(() => {
    if (!user) return;

    const db = firebase.firestore();
    const unsubscribe = db
      .collection('users')
      .doc(user.uid)
      .collection('items')
      .orderBy('addedOn', 'desc')
      .onSnapshot((snapshot) => {
        // snapshot.docs.forEach((d) => {
        //   const data = d.data();
        //   if (!data.scheduledOn) {
        //     schedule(d.ref as any);
        //   }
        // });
        setBookmarks(
          snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );
      });
    return () => unsubscribe();
  }, [user]);

  const [url, setUrl] = React.useState('');

  const addUrl = async () => {
    if (user) {
      // TODO: check `url` is a valid URL before doing a request
      const result = await fetchStats(url);

      console.log(result);

      const db = firebase.firestore();
      const items = db
        .collection('users')
        .doc(user.uid)
        .collection('items') as firebase.firestore.CollectionReference<Item>;

      const existing = (await items.where('url', '==', result.url).get())
        .docs[0];
      if (existing) {
        await existing.ref.update(result);
        if (!existing.data().scheduledOn) {
          schedule(existing.ref);
        }
      } else {
        const itemRef = await items.add({
          url,
          nPins: 0,
          ...result,
          addedOn: new Date(),
        });
        await schedule(itemRef);
      }
    }
    setUrl('');
  };

  return (
    <div>
      <button onClick={handleClick}>{'Sign in'}</button>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <div style={{ marginBottom: 16 }}>
        <input value={url} onChange={(e) => setUrl(e.target.value)} />
        <button onClick={addUrl}>{'Add'}</button>
      </div>
      {/* <pre>{JSON.stringify(bookmarks, null, 2)}</pre> */}

      <Review />
      <ItemsList items={bookmarks} />
    </div>
  );
};

export default Index;
