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
  Switch,
} from '@material-ui/core';
import ArrowBack from '@material-ui/icons/ArrowBack';

import firebase from '@/firebase/client';
import { useUser } from '@/context/userContext';
import { exportItems, importItems } from '@/lib/items';
import { saveAuditOptIn, useAuditOptIn } from './lib/audit';

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
    signOutText: {
      marginRight: 32,
    },
    sectionHeader: {
      marginTop: 16,
      marginBottom: 8,
    },
    section: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    button: {
      textTransform: 'none',
      marginRight: 8,
      marginBottom: 8,
    },
  })
);

const SettingsPage = ({}: SettingsPageProps) => {
  const history = useHistory();
  const { user } = useUser();
  const auditOptIn = useAuditOptIn();

  const [snackbarContent, setSnackbarContent] = React.useState<string | null>(
    null
  );

  const classes = useStyles();
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
        <Typography variant="h6" className={classes.sectionHeader}>
          {'Account'}
        </Typography>
        <div className={classes.section}>
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
        <Typography variant="h6" className={classes.sectionHeader}>
          {'Data'}
        </Typography>
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
        <Typography variant="h6" className={classes.sectionHeader}>
          {'Data collection'}
        </Typography>
        <div className={classes.section}>
          <Typography variant="body2">
            {'Collect data for scheduling algorithm development'}
          </Typography>
          <Switch
            checked={auditOptIn ?? false}
            onChange={(e) => {
              saveAuditOptIn(e.target.checked);
            }}
          />
        </div>
      </Container>
    </div>
  );
};

export default SettingsPage;
