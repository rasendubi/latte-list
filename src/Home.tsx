import React from 'react';
import { useHistory } from 'react-router-dom';

import {
  Button,
  createStyles,
  Fab,
  IconButton,
  makeStyles,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import { AppBar, Toolbar } from '@material-ui/core';

import firebase, { useCollection } from '@/firebase/client';
import { useUser } from '@/context/userContext';
import ItemsList from '@/components/ItemsList';
import { Item } from '@/lib/Item';
import { useReviewItem } from '@/lib/useReviewItem';
import { AddIcon, LogoutIcon } from '@/lib/icons';

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
    itemsList: {
      alignSelf: 'stretch',
    },
    addButton: {
      position: 'absolute',
      right: 16,
      bottom: 16,
    },
  })
);

const Index = ({}: IndexProps) => {
  const handleClick = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await firebase.auth().signInWithPopup(provider);
  };

  const { user } = useUser();

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

  const history = useHistory();

  const { item: reviewItem, isLoading: isReviewLoading } = useReviewItem(5000);

  const classes = useStyles();

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography style={{ flexGrow: 1 }}>{'Home'}</Typography>
          {reviewItem && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => history.push('/review')}
            >
              {'Review'}
            </Button>
          )}
          <IconButton
            color="inherit"
            edge="end"
            style={{ marginLeft: 8 }}
            onClick={() => firebase.auth().signOut()}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
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
        <ItemsList className={classes.itemsList} items={pinned?.docs ?? []} />
        <Fab
          className={classes.addButton}
          color="secondary"
          onClick={() => history.push('/add')}
        >
          <AddIcon />
        </Fab>
      </div>
    </>
  );
};

export default Index;
