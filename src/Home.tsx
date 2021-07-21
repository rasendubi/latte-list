import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import firebase, { useCollection } from '@/firebase/client';
import { useUser } from '@/context/userContext';

import ItemsList from '@/components/ItemsList';
import { scheduleLater } from '@/lib/scheduling';
import { Item } from '@/lib/Item';
import { Button } from '@material-ui/core';

export interface IndexProps {}

const Index = ({}: IndexProps) => {
  const location = useLocation();

  const handleClick = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await firebase.auth().signInWithPopup(provider);
  };

  const { user, isLoading } = useUser();

  const pinnedQuery = React.useMemo(() => {
    if (!user) return null;
    const base = firebase
      .firestore()
      .collection(
        `users/${user.uid}/items`
      ) as firebase.firestore.CollectionReference<Item>;

    return location.pathname === '/all'
      ? base.orderBy('addedOn')
      : base.where('pinnedOn', '!=', null).orderBy('pinnedOn');
  }, [user, location]);
  const pinned = useCollection(pinnedQuery);

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
      <ItemsList items={pinned?.docs ?? []} />
    </div>
  );
};

export default Index;
