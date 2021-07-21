import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { Button, Typography } from '@material-ui/core';

import firebase, { useCollection } from '@/firebase/client';
import { useUser } from '@/context/userContext';
import ItemsList from '@/components/ItemsList';
import { Item } from '@/lib/Item';
import { useReviewItem } from '@/lib/useReviewItem';

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

  const { item: reviewItem, isLoading: isReviewLoading } = useReviewItem(5000);

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
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <div style={{ marginBottom: 16 }}>
        <input value={url} onChange={(e) => setUrl(e.target.value)} />
        <button onClick={addUrl}>{'Add'}</button>
      </div>
      {pinned &&
        !pinned.docs.length &&
        (isReviewLoading ? null : (
          <>
            <Typography
              style={{ margin: '64px 24px' }}
              color="textSecondary"
              align="center"
            >
              {reviewItem
                ? 'No pinned items'
                : 'No items to review. Bookmark more and come back later.'}
            </Typography>
            {reviewItem && (
              <Button
                // variant="outlined"
                variant="contained"
                color="primary"
                disabled={!reviewItem}
                onClick={() => history.push('/review')}
              >
                {'Review more'}
              </Button>
            )}
          </>
        ))}
      <ItemsList items={pinned?.docs ?? []} />
      {/* {isReviewLoading ? null : reviewItem ? (
        <Button
          variant="outlined"
          color="primary"
          disabled={!reviewItem}
          onClick={() => history.push('/review')}
        >
          {'Review more'}
        </Button>
      ) : (
        <Typography variant="body2">{'No items to review'}</Typography>
      )} */}
    </div>
  );
};

export default Index;
