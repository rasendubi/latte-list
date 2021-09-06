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
import { saveAuditOptIn, useAuditOptIn } from '@/lib/audit';
import { useNotifications } from '@/lib/notifications';
import { ChromeIcon, FirefoxIcon } from '@/lib/icons';
import DeleteAccountDialog from './components/DeleteAccountDialog';

export interface SettingsPageProps {}

const SettingsPage = ({}: SettingsPageProps) => {
  const history = useHistory();
  const { user } = useUser();
  const auditOptIn = useAuditOptIn();

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

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

        <Section title="Data">
          <div className={classes.buttonLine}>
            <Button
              variant="outlined"
              onClick={() => user && exportItems(user.uid)}
            >
              {'Export'}
            </Button>
            <Button
              variant="outlined"
              onClick={async () => {
                if (!user) return;
                const { itemsImported } = await importItems(user.uid);
                setSnackbarContent(`${itemsImported} items imported`);
              }}
            >
              {'Import'}
            </Button>
          </div>
          <Snackbar
            open={!!snackbarContent}
            autoHideDuration={5000}
            onClose={() => setSnackbarContent(null)}
            message={snackbarContent}
          />
        </Section>

        <Section title="Account">
          <div className={classes.sectionLine}>
            <Typography className={classes.signOutText} gutterBottom={true}>
              {'Signed in as '}
              {user?.email}
            </Typography>
            <Button
              variant="outlined"
              style={{ flex: 'none' }}
              onClick={() => firebase.auth().signOut()}
            >
              {'Sign Out'}
            </Button>
          </div>
          <div className={classes.sectionLine}>
            <Button
              size="small"
              style={{ color: '#C56C6C', marginLeft: -5 }}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete account
            </Button>
          </div>
          <DeleteAccountDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onDelete={() => firebase.auth().currentUser?.delete()}
          />
        </Section>

        <Section title="Browser extensions">
          <div className={classes.buttonLine}>
            <Button
              variant="outlined"
              href="https://chrome.google.com/webstore/detail/latte-list/jkdfdapgbjiabmmlckaibmapkdkmgfjp"
              startIcon={<ChromeIcon className={classes.browserIcon} />}
            >
              Chrome
            </Button>
            <Button
              variant="outlined"
              href="https://addons.mozilla.org/en-US/firefox/addon/latte-list/"
              startIcon={<FirefoxIcon className={classes.browserIcon} />}
            >
              Firefox
            </Button>
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
    buttonLine: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
    },
    browserIcon: {
      width: 20,
      height: 20,
    },
  })
);
