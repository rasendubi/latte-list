import React from 'react';
import getUrls from 'get-urls';
import { useHistory } from 'react-router-dom';

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

import firebase, { useMeta } from '@/firebase/client';
import { saveItem } from '@/lib/items';
import ItemCard from '@/components/ItemCard';
import { Item } from '@/lib/Item';
import { useDebounce } from 'react-use';

export interface AddDialogProps extends DialogProps {}

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

const AddDialog = ({ ...props }: AddDialogProps) => {
  const classes = useStyles();

  const [title, setTitle] = React.useState<string | null>(null);
  const [url, setUrl] = React.useState<string | null | undefined>(undefined);

  // TODO: this should be extracted to outside
  React.useEffect(() => {
    const u = new URL(window.location.toString());
    const title = u.searchParams.get('title');
    const text = u.searchParams.get('text');
    const surl = u.searchParams.get('url');

    const url =
      surl ||
      findUrlIn(text ?? '') ||
      // not sure if any app sends it in title?
      findUrlIn(title ?? '');

    if (title && (text || surl)) {
      setTitle(title);
    }
    setUrl(url);
  }, []);

  const [debouncedUrl, setDebouncedUrl] = React.useState(url);
  useDebounce(() => setDebouncedUrl(url), 500, [url]);
  const { meta, isLoading: metaIsLoading } = useMeta(debouncedUrl);
  const isLoading = metaIsLoading || url !== debouncedUrl;

  const item: Item = {
    url: meta?.url || url || '',
    title: title || meta?.title || meta?.url || url || '',
    meta,
    nPins: 0,
    spacingParams: null,
    addedOn: firebase.firestore.Timestamp.now(),
    scheduledOn: null,
    archivedOn: null,
    pinnedOn: null,
  };

  const history = useHistory();
  const [isSaving, setIsSaving] = React.useState(false);
  const handleSaveClick = async () => {
    const user = firebase.auth().currentUser;
    setIsSaving(true);
    if (user) {
      await saveItem(user.uid, item);
    }
    history.replace('/');
  };

  return (
    <Dialog {...props}>
      <Backdrop open={isSaving} className={classes.backdrop}>
        <CircularProgress />
      </Backdrop>
      <AppBar className={classes.appBar} position="static" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => history.replace('/')}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.dialogTitle}>
            {'Add item'}
          </Typography>
          <Button color="inherit" onClick={handleSaveClick}>
            Save
          </Button>
        </Toolbar>
      </AppBar>
      <TextField
        className={classes.input}
        margin="dense"
        name="url"
        label="URL"
        value={url ?? ''}
        onChange={(e) => setUrl(e.target.value)}
      />
      <TextField
        className={classes.input}
        margin="dense"
        name="title"
        label="Title"
        value={title ?? meta?.title ?? ''}
        onChange={(e) => setTitle(e.target.value)}
      />
      {meta ? (
        <ItemCard variant="outlined" className={classes.card} item={item} />
      ) : (
        isLoading && <CircularProgress className={classes.progress} />
      )}
    </Dialog>
  );
};

export default AddDialog;

function findUrlIn(text: string): string | null {
  // This unpacking relies on Sets preserving insertion order
  const urls = [...getUrls(text, { requireSchemeOrWww: true })];
  if (!urls.length) return null;
  // when urls are appended to "text" param, they are usually
  // (always?) the last
  return urls[urls.length - 1];
}
