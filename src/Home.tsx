import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import {
  Button,
  createStyles,
  makeStyles,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';

import firebase, { useCollection } from '@/firebase/client';
import { useUser } from '@/context/userContext';
import ItemsList from '@/components/ItemsList';
import { Item } from '@/lib/Item';
import { useReviewItem } from '@/lib/useReviewItem';

export interface IndexProps {}

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      maxWidth: 720,
      margin: '0 auto',
      padding: 8,
    },
    captionLine: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      alignSelf: 'stretch',
      padding: 8,
      position: 'sticky',
    },
    filterSelect: {
      fontSize: theme.typography.caption.fontSize,
    },
  })
);

const Index = ({}: IndexProps) => {
  const handleClick = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await firebase.auth().signInWithPopup(provider);
  };

  const { user, isLoading } = useUser();

  const [filter, setFilter] = React.useState('pinned');

  const pinnedQuery = React.useMemo(() => {
    if (!user) return null;
    const base = firebase
      .firestore()
      .collection(
        `users/${user.uid}/items`
      ) as firebase.firestore.CollectionReference<Item>;

    return filter === 'all'
      ? base.orderBy('addedOn')
      : base.where('pinnedOn', '!=', null).orderBy('pinnedOn');
  }, [user, filter]);
  const pinned = useCollection(pinnedQuery);

  const [url, setUrl] = React.useState('');

  const history = useHistory();

  const addUrl = async () => {
    history.push(`/add?url=${encodeURIComponent(url)}`);
    setUrl('');
  };

  const { item: reviewItem, isLoading: isReviewLoading } = useReviewItem(5000);

  const classes = useStyles();

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
    <div className={classes.root}>
      <div className={classes.captionLine}>
        <Typography variant="subtitle2">{'Items'}</Typography>
        <Select
          // native={true}
          className={classes.filterSelect}
          disableUnderline={true}
          value={filter}
          onChange={(e) => setFilter(e.target.value as string)}
        >
          <MenuItem value={'all'}>{'All'}</MenuItem>
          <MenuItem value={'pinned'}>{'Pinned'}</MenuItem>
        </Select>
      </div>
      {/* <div style={{ marginBottom: 16 }}>
        <input value={url} onChange={(e) => setUrl(e.target.value)} />
        <button onClick={addUrl}>{'Add'}</button>
      </div> */}
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
