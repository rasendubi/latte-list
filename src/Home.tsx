import React from 'react';
import { useHistory } from 'react-router-dom';
import moment from 'moment';

import {
  Button,
  createStyles,
  Fab,
  IconButton,
  makeStyles,
  MenuItem,
  Select,
  Typography,
  AppBar,
  Toolbar,
  Container,
} from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';

import firebase, { useCollection } from '@/firebase/client';
import { useUser } from '@/context/userContext';
import ItemsList from '@/components/ItemsList';
import { Item } from '@/lib/Item';
import { useReviewItem } from '@/lib/useReviewItem';
import { AddIcon } from '@/lib/icons';
import { Favicon } from '@/lib/favicon';
import { useNotifications } from './lib/notifications';
import InstallBar from './components/InstallBar';

export interface HomeProps {}

const Home = ({}: HomeProps) => {
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
      ? base.orderBy('addedOn', 'desc')
      : base.where('pinnedOn', '!=', null).orderBy('pinnedOn');
  }, [user, filter]);
  const pinned = useCollection(pinnedQuery);

  const history = useHistory();

  const {
    item: reviewItem,
    isLoading: isReviewLoading,
    nextReview,
    now,
  } = useReviewItem(1000);

  // badge when review is available
  const favicon = React.useRef<Favicon>(
    new Favicon({
      faviconHref: '/favicon.svg',
      link: document.getElementById('favicon') as HTMLLinkElement,
    })
  );
  React.useEffect(() => {
    favicon.current.badge(!!reviewItem);
  }, [reviewItem]);

  const notifications = useNotifications();

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
            aria-label="Settings"
            onClick={() => history.push('/settings')}
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <InstallBar />
      <Container className={classes.root} maxWidth="sm">
        <div className={classes.captionLine}>
          <Typography variant="subtitle2">{'Items'}</Typography>
          <Select
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
                style={{ marginTop: 64, marginLeft: 24, marginRight: 24 }}
                // color="textSecondary"
                align="center"
                gutterBottom={true}
              >
                {reviewItem
                  ? 'No pinned items'
                  : nextReview
                  ? 'Next review ' + moment(nextReview).from(now)
                  : 'No items to review. Bookmark more and come back later.'}
              </Typography>
              {reviewItem ? (
                <Button
                  // variant="outlined"
                  variant="contained"
                  color="primary"
                  disabled={!reviewItem}
                  onClick={() => history.push('/review')}
                >
                  {'Review'}
                </Button>
              ) : nextReview &&
                notifications.supported &&
                notifications.permission !== 'denied' &&
                notifications.enabled === false ? (
                <Button
                  variant="outlined"
                  color="primary"
                  style={{ marginTop: 12 }}
                  onClick={() => notifications.setEnabled(true)}
                >
                  {'Notify me'}
                </Button>
              ) : nextReview &&
                notifications.supported &&
                notifications.enabled ? (
                <Typography
                  variant="caption"
                  color="textSecondary"
                  align="center"
                >
                  You will be notified
                </Typography>
              ) : null}
            </>
          ))}
        <ItemsList className={classes.itemsList} items={pinned?.docs ?? []} />
        <Fab
          className={classes.addButton}
          color="secondary"
          aria-label="Add item"
          onClick={() => history.push('/add')}
        >
          <AddIcon />
        </Fab>
      </Container>
    </>
  );
};

export default Home;

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: 16,
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
      position: 'fixed',
      right: 16,
      bottom: 16,
    },
  })
);
