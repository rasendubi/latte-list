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

import Chrome from '@fortawesome/fontawesome-free/svgs/brands/chrome.svg';
import Firefox from '@fortawesome/fontawesome-free/svgs/brands/firefox.svg';

import firebase, { useCollection } from '@/firebase/client';
import { useUser } from '@/context/userContext';
import ItemsList from '@/components/ItemsList';
import { Item } from '@/lib/Item';
import { useReviewItem } from '@/lib/useReviewItem';
import { AddIcon } from '@/lib/icons';
import { useNotifications } from '@/lib/notifications';
import InstallBar from '@/components/InstallBar';
import { useFaviconBadge } from '@/lib/useFaviconBadge';

export interface HomeProps {}

const Home = ({}: HomeProps) => {
  const { user } = useUser();

  const [filter, setFilter] = React.useState('pinned');

  const query = React.useMemo(() => {
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
  const items = useCollection(query);

  const anyItemQuery = React.useMemo(() => {
    return (
      user &&
      (firebase
        .firestore()
        .collection(`users/${user.uid}/items`)
        .limit(1) as firebase.firestore.CollectionReference<Item>)
    );
  }, [user]);
  const anyItem = useCollection(anyItemQuery);

  const history = useHistory();

  const {
    item: reviewItem,
    isLoading: isReviewLoading,
    nextReview,
    now,
  } = useReviewItem(1000);

  useFaviconBadge(!!reviewItem);

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
        {!anyItem ? null /* still loading */ : anyItem.docs.length === 0 ? (
          <>
            <Typography
              variant="h4"
              style={{ marginTop: 64, marginLeft: 24, marginRight: 24 }}
              align="center"
              gutterBottom={true}
            >
              Add your first item
            </Typography>
            <Typography align="center">
              You can add items by using the “+” button below or from one of our
              browser extensions:
            </Typography>
            <div className={classes.browserButtonsLine}>
              <Button
                variant="outlined"
                href="https://chrome.google.com/webstore/detail/latte-list/jkdfdapgbjiabmmlckaibmapkdkmgfjp"
                startIcon={<img className={classes.browserIcon} src={Chrome} />}
              >
                Chrome
              </Button>
              <Button
                variant="outlined"
                href="https://addons.mozilla.org/en-US/firefox/addon/latte-list/"
                startIcon={
                  <img className={classes.browserIcon} src={Firefox} />
                }
              >
                Firefox
              </Button>
            </div>
            <Typography align="center">
              If you open the app from the Chrome on your mobile phone, you can
              install it, and then add items by sharing into the app.
            </Typography>
          </>
        ) : (
          <>
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
            {items?.docs.length === 0 && !isReviewLoading && (
              <>
                <Typography
                  style={{ marginTop: 64, marginLeft: 24, marginRight: 24 }}
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
            )}
          </>
        )}
        <ItemsList className={classes.itemsList} items={items?.docs ?? []} />
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
    browserButtonsLine: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      margin: '8px 0 16px',
    },
    browserIcon: {
      width: 20,
      height: 20,
    },
  })
);
