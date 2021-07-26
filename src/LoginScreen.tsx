import React from 'react';

import {
  Button,
  createStyles,
  makeStyles,
  Typography,
} from '@material-ui/core';
import GoogleIcon from '@material-ui/icons/Google';

import firebase from '@/firebase/client';

export interface LoginScreenProps {}

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    signInButton: {
      textTransform: 'unset',
    },
    error: {
      marginTop: 8,
    },
  })
);

const LoginScreen = ({}: LoginScreenProps) => {
  const classes = useStyles();

  const [error, setError] = React.useState<null | firebase.auth.Error>(null);

  const signIn = async () => {
    try {
      setError(null);

      const isFirefoxExtension = window.location.protocol === 'moz-extension:';
      const provider = new firebase.auth.GoogleAuthProvider();
      if (isFirefoxExtension) {
        // webextension-polyfill can only be imported in extension context
        const browser = await import('webextension-polyfill');

        const nonce = Math.floor(Math.random() * 10000);
        const oauthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
        const redirectUrl = browser.identity.getRedirectURL();
        const responseUrl = await browser.identity.launchWebAuthFlow({
          url: `https://accounts.google.com/o/oauth2/v2/auth?response_type=id_token&nonce=${nonce}&scope=openid%20profile&client_id=${oauthClientId}&redirect_uri=${redirectUrl}`,
          interactive: true,
        });
        const idToken = responseUrl.split('id_token=')[1].split('&')[0];

        const credential = firebase.auth.GoogleAuthProvider.credential(idToken);
        await firebase.auth().signInWithCredential(credential);
      } else {
        await firebase.auth().signInWithPopup(provider);
      }
    } catch (e) {
      if (typeof e.code === 'string' && e.code.startsWith('auth/')) {
        setError(e);
      } else {
        throw e;
      }
    }
  };

  return (
    <div className={classes.root}>
      <Button
        className={classes.signInButton}
        color="primary"
        variant="contained"
        startIcon={<GoogleIcon />}
        onClick={signIn}
      >
        {'Sign in with Google'}
      </Button>
      {error && (
        <Typography
          variant="caption"
          align="center"
          color="error"
          className={classes.error}
        >
          {error.message}
        </Typography>
      )}
    </div>
  );
};

export default LoginScreen;
