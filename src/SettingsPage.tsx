import React from 'react';
import { useHistory } from 'react-router-dom';

import {
  AppBar,
  Button,
  Container,
  IconButton,
  makeStyles,
  createStyles,
  Toolbar,
  Typography,
  Snackbar,
} from '@material-ui/core';
import ArrowBack from '@material-ui/icons/ArrowBack';

import firebase from '@/firebase/client';
import { useUser } from '@/context/userContext';
import { exportItems, importItems } from '@/lib/items';

export interface SettingsPageProps {}

const useStyles = makeStyles((theme) =>
  createStyles({
    main: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'stretch',
    },
    container: {
      flexGrow: 1,
      paddingTop: 16,
      paddingBottom: 16,
      backgroundColor: theme.palette.common.white,
    },
    signOutSection: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    signOutText: {
      marginRight: 32,
    },
    button: {
      textTransform: 'none',
    },
  })
);

const SettingsPage = ({}: SettingsPageProps) => {
  const history = useHistory();
  const { user } = useUser();
  const classes = useStyles();

  const [snackbarContent, setSnackbarContent] = React.useState<string | null>(
    null
  );

  return (
    <div className={classes.main}>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => history.goBack()}
          >
            <ArrowBack />
          </IconButton>
          <Typography>{'Settings'}</Typography>
        </Toolbar>
      </AppBar>
      <Container className={classes.container} maxWidth="sm">
        <Typography variant="h6">{'Account'}</Typography>
        <div className={classes.signOutSection}>
          <Typography className={classes.signOutText} gutterBottom={true}>
            {'Signed in as '}
            {user?.email}
          </Typography>
          <Button
            variant="outlined"
            className={classes.button}
            onClick={() => firebase.auth().signOut()}
          >
            {'Sign Out'}
          </Button>
        </div>
        <Typography variant="h6">{'Data'}</Typography>
        <Button
          variant="outlined"
          className={classes.button}
          onClick={() => user && exportItems(user.uid)}
        >
          {'Export'}
        </Button>
        <Button
          variant="outlined"
          className={classes.button}
          onClick={async () => {
            if (!user) return;
            const { itemsImported } = await importItems(user.uid);
            setSnackbarContent(`${itemsImported} items imported`);
          }}
        >
          {'Import'}
        </Button>
        <Snackbar
          open={!!snackbarContent}
          autoHideDuration={5000}
          onClose={() => setSnackbarContent(null)}
          message={snackbarContent}
        />
      </Container>
    </div>
  );
};

export default SettingsPage;
