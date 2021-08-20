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
import { useNotifications } from '@/lib/notifications';

export interface SettingsPageProps {}

const SettingsPage = ({}: SettingsPageProps) => {
  const history = useHistory();
  const { user } = useUser();
  const auditOptIn = useAuditOptIn();

  const [snackbarContent, setSnackbarContent] = React.useState<string | null>(
    null
  );

  const notifications = useNotifications();

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
        <Section title="Account">
          <div className={classes.sectionLine}>
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
        </Section>

        <Section title="Notifications">
          {notifications.supported ? (
            <>
              <div className={classes.sectionLine}>
                <Typography>{'Enable notifications'}</Typography>
                {notifications.enabled !== undefined && (
                  <Switch
                    checked={notifications.enabled}
                    onChange={(e) => {
                      notifications.setEnabled(e.target.checked);
                    }}
                  />
                )}
              </div>
              {notifications.permission === 'denied' && (
                <Typography variant="caption" color="error">
                  Notifications are disabled in the browser. You need to enable
                  them in the browser first before enabling them here.
                </Typography>
              )}
            </>
          ) : notifications.supported === false ? (
            <Typography variant="caption" color="error">
              Notifications are not supported in your browser.
            </Typography>
          ) : /* still loading */
          null}
        </Section>

        <Section title="Data">
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
        </Section>

        <Section title="Data collection">
          <div className={classes.sectionLine}>
            <Typography>
              {'Collect data for scheduling algorithm development'}
            </Typography>
            <Switch
              checked={auditOptIn ?? false}
              onChange={(e) => {
                saveAuditOptIn(e.target.checked);
              }}
            />
          </div>
        </Section>
      </Container>
    </div>
  );
};

export default SettingsPage;

export interface SectionProps {
  title: React.ReactNode;
  children?: React.ReactNode;
}
const Section = ({ title, children }: SectionProps) => {
  const classes = useStyles();
  return (
    <div className={classes.section}>
      <Typography variant="h6" className={classes.sectionHeader}>
        {title}
      </Typography>
      <div className={classes.section}>{children}</div>
    </div>
  );
};

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
      // display: 'flex',
      // flexWrap: 'wrap',
      // alignItems: 'center',
      // justifyContent: 'space-between',
    },
    sectionLine: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    button: {
      textTransform: 'none',
      marginRight: 8,
      marginBottom: 8,
      flex: 'none',
    },
  })
);
