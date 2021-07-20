import React from 'react';

import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Backdrop,
  Button,
  CircularProgress,
  DialogActions,
  IconButton,
  TextField,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import LaterIcon from '@material-ui/icons/WatchLater';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import PinIcon from '@material-ui/icons/Bookmark';

import firebase, { useCollection } from '@/firebase/client';
import { useUser } from '@/context/userContext';
import { scheduleLater } from './lib/scheduling';
import { Item } from './lib/Item';
import ItemCard from './components/ItemCard';
import { pinItem } from './lib/items';

export interface ReviewDialogProps extends DialogProps {
  onClose?: () => void;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    appBar: {
      // position: 'relative',
    },
    dialogTitle: {
      flex: 1,
    },
    cardWrapper: {
      flex: 'auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: theme.spacing(1),
    },
    card: {
      marginTop: theme.spacing(2),
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    progress: {
      marginTop: theme.spacing(8),
      alignSelf: 'center',
    },
    buttonGroup: {
      justifyContent: 'center',
    },
    iconButton: {
      minWidth: 72,
    },
    iconButtonLabel: {
      flexDirection: 'column',
    },
    doneWrapper: {
      flex: 'auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
  })
);

const ReviewDialog = ({ onClose, ...props }: ReviewDialogProps) => {
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setNow(new Date());
  }, []);

  const { user } = useUser();
  const query = React.useMemo(
    () =>
      user &&
      (firebase
        .firestore()
        .collection(`users/${user.uid}/items`)
        .where('scheduledOn', '<', now)
        .orderBy('scheduledOn')
        .limit(1) as firebase.firestore.Query<Item>),
    [user, now]
  );

  const reviewQueue = useCollection(query);

  const item = reviewQueue?.docs[0];

  const handleLater = () => {
    item && scheduleLater(item);
  };

  const handlePin = () => {
    item && pinItem(item);
  };

  const classes = useStyles();

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog fullScreen={fullScreen} {...props}>
      <AppBar className={classes.appBar} position="static" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.dialogTitle}>
            {'Review'}
          </Typography>
        </Toolbar>
      </AppBar>
      {!reviewQueue && <CircularProgress className={classes.progress} />}
      {reviewQueue && reviewQueue.docs.length === 0 && (
        <div className={classes.doneWrapper}>
          <Typography variant="body1" paragraph={true}>
            {'That’s all for now'}
          </Typography>
          <Button variant="contained" color="primary" onClick={onClose}>
            {'Close'}
          </Button>
        </div>
      )}
      {item && (
        <>
          <div className={classes.cardWrapper}>
            <ItemCard item={item.data()} />
          </div>
          <DialogActions className={classes.buttonGroup}>
            <Button
              size="large"
              onClick={handleLater}
              classes={{
                root: classes.iconButton,
                label: classes.iconButtonLabel,
              }}
            >
              <LaterIcon />
              <Typography variant="caption">{'Later'}</Typography>
            </Button>
            <Button
              size="large"
              classes={{
                root: classes.iconButton,
                label: classes.iconButtonLabel,
              }}
            >
              <DeleteIcon />
              <Typography variant="caption">{'Delete'}</Typography>
            </Button>
            <Button
              size="large"
              classes={{
                root: classes.iconButton,
                label: classes.iconButtonLabel,
              }}
            >
              <DoneIcon />
              <Typography variant="caption">{'Archive'}</Typography>
            </Button>
            <Button
              size="large"
              classes={{
                root: classes.iconButton,
                label: classes.iconButtonLabel,
              }}
              onClick={handlePin}
            >
              <PinIcon />
              <Typography variant="caption">{'Pin'}</Typography>
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default ReviewDialog;
