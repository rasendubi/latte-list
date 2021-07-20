import React from 'react';
import { useHistory } from 'react-router-dom';

import firebase, { fetchStats } from '@/firebase/client';
import { useUser } from '@/context/userContext';

import ItemsList from '@/components/ItemsList';
import { schedule } from '@/lib/scheduling';
import { Item } from '@/lib/Item';
import { Button } from '@material-ui/core';

export interface IndexProps {}

const Index = ({}: IndexProps) => {
  const handleClick = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await firebase.auth().signInWithPopup(provider);
  };

  const { user, isLoading } = useUser();

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

  const history = useHistory();

  const addUrl = async () => {
    history.push(`/add?url=${encodeURIComponent(url)}`);
    setUrl('');
  };

  if (isLoading) {
    return null;
  }

  if (!user) {
    return (
      <div>
        <button onClick={handleClick}>{'Sign in'}</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <input value={url} onChange={(e) => setUrl(e.target.value)} />
        <button onClick={addUrl}>{'Add'}</button>
        <Button onClick={() => history.push('/review')}>{'Review'}</Button>
      </div>
      {/* <pre>{JSON.stringify(bookmarks, null, 2)}</pre> */}
      <ItemsList items={bookmarks} />
    </div>
  );
};

export default Index;
