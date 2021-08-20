import React from 'react';

import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Button,
  CircularProgress,
  DialogActions,
  IconButton,
  Toolbar,
} from '@material-ui/core';

import ItemCard from '@/components/ItemCard';
import { archiveItem, deleteItem, pinItem, scheduleLater } from '@/lib/items';
import { useReviewItem } from '@/lib/useReviewItem';
import {
  CloseIcon,
  ArchiveIcon,
  LaterIcon,
  DeleteIcon,
  PinIcon,
} from '@/lib/icons';
import { useAuditOptIn } from '@/lib/audit';
import { useCloseNotifications } from '@/lib/notifications';

import ReviewTour from './ReviewTour';

export interface ReviewDialogProps extends DialogProps {
  onClose?: () => void;
}

const ReviewDialog = ({ onClose, ...props }: ReviewDialogProps) => {
  useCloseNotifications({ tag: 'review' });

  const { item, isLoading } = useReviewItem();

  // auto-close when review is done
  React.useLayoutEffect(() => {
    if (!isLoading && !item) {
      onClose?.();
    }
  }, [isLoading, item]);

  const auditOptIn = useAuditOptIn();
  // open review tour if the user hasn’t yet answered the audit opt in
  // question
  const reviewTourOpen = auditOptIn === null;

  const handleLater = () => {
    item && scheduleLater(item, { review: true });
  };
  const handlePin = () => {
    item && pinItem(item, { review: true });
  };
  const handleDelete = () => {
    item && deleteItem(item, { review: true });
  };
  const handleArchive = () => {
    item && archiveItem(item, { review: true });
  };

  const classes = useStyles();
  return (
    <Dialog {...props}>
      <AppBar className={classes.appBar} position="static" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            data-tour="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.dialogTitle}>
            {'Review'}
          </Typography>
        </Toolbar>
      </AppBar>
      {isLoading && <CircularProgress className={classes.progress} />}
      {!isLoading && !item && (
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
          <ReviewTour open={reviewTourOpen} />
          <div className={classes.cardWrapper}>
            {/* specify key, so there is no flash of old images when item completely changes */}
            <ItemCard
              key={item.id}
              item={item.data()}
              variant="outlined"
              data-tour="card"
            />
          </div>
          <DialogActions className={classes.buttonGroup}>
            <Button
              size="large"
              onClick={handleLater}
              classes={{
                root: classes.iconButton,
                label: classes.iconButtonLabel,
              }}
              data-tour="later"
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
              onClick={handleDelete}
              data-tour="delete"
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
              onClick={handleArchive}
              data-tour="archive"
            >
              <ArchiveIcon />
              <Typography variant="caption">{'Archive'}</Typography>
            </Button>
            <Button
              size="large"
              classes={{
                root: classes.iconButton,
                label: classes.iconButtonLabel,
              }}
              onClick={handlePin}
              data-tour="pin"
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
      alignItems: 'center',
      padding: theme.spacing(1),
      maxWidth: 600,
      alignSelf: 'center',
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
