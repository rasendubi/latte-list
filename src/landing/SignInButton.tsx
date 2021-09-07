import React from 'react';

import {
  Button,
  createStyles,
  makeStyles,
  Typography,
} from '@material-ui/core';
import GoogleIcon from '@material-ui/icons/Google';

import firebase from '@/firebase/client';

export interface SignInButtonProps {
  variant?: 'short' | 'default';
}

const SignInButton = ({ variant }: SignInButtonProps) => {
  const classes = useStyles();

  const [error, setError] = React.useState<null | firebase.auth.Error>(null);
  React.useEffect(() => {
    firebase
      .auth()
      .getRedirectResult()
      .then(() => {
        // not interested in the user object
      })
      .catch((e) => {
        if (typeof e.code === 'string' && e.code.startsWith('auth/')) {
          setError(e);
        } else {
          throw e;
        }
      });
  }, []);

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
        // There are issues with sign in mobile safari. See
        // https://github.com/firebase/firebase-js-sdk/issues/4256#issuecomment-852252857
        //
        // One of the suggested solutions is using
        // `signInWithRedirect` instead of `signInWithPopup`.
        await firebase.auth().signInWithRedirect(provider);
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
        {variant === 'short' ? 'Sign in' : 'Sign in with Google'}
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

export default SignInButton;

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    signInButton: {
      textTransform: 'unset',
    },
    error: {
      marginTop: 8,
    },
  })
);
