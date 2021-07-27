import React from 'react';

import Typography from '@material-ui/core/Typography';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import {
  AppBar,
  Backdrop,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Toolbar,
} from '@material-ui/core';

import ItemCard from '@/components/ItemCard';
import { Item } from '@/lib/Item';

export interface AddDialogViewProps extends DialogProps {
  url: string;
  item: Item;
  isLoading: boolean;
  isSaving: boolean;

  onUrlChange: (url: string) => void;
  onTitleChange: (title: string) => void;
  onCloseClick: () => void;
  onSaveClick: () => void;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    backdrop: {
      zIndex: theme.zIndex.appBar + 1,
    },
    appBar: {
      // position: 'relative',
    },
    dialogTitle: {
      flex: 1,
    },
    input: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    progress: {
      marginTop: theme.spacing(8),
      alignSelf: 'center',
    },
    card: {
      marginTop: theme.spacing(2),
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      maxWidth: 600,
      alignSelf: 'center',
    },
  })
);

const AddDialogView = ({
  url,
  title,
  item,
  isLoading,
  isSaving,
  onUrlChange,
  onTitleChange,
  onCloseClick,
  onSaveClick,
  ...props
}: AddDialogViewProps) => {
  const classes = useStyles();

  return (
    <Dialog {...props}>
      <Backdrop open={isSaving} className={classes.backdrop}>
        <CircularProgress />
      </Backdrop>
      <AppBar className={classes.appBar} position="static" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onCloseClick}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.dialogTitle}>
            {'Add item'}
          </Typography>
          <Button color="inherit" onClick={onSaveClick}>
            Save
          </Button>
        </Toolbar>
      </AppBar>
      <TextField
        className={classes.input}
        margin="dense"
        name="url"
        label="URL"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
      />
      <TextField
        className={classes.input}
        margin="dense"
        name="title"
        label="Title"
        value={item.title ?? item.meta?.title ?? ''}
        onChange={(e) => onTitleChange(e.target.value)}
      />
      {isLoading ? (
        <CircularProgress className={classes.progress} />
      ) : (
        <ItemCard variant="outlined" className={classes.card} item={item} />
      )}
    </Dialog>
  );
};

export default AddDialogView;
