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
  const handleError = (e: any) => {
    if (typeof e.code === 'string' && e.code.startsWith('auth/')) {
      setError(e);
    } else {
      throw e;
    }
  };

  // check if we have just completed the authentication via redirect
  // flow or extension auth
  React.useEffect(() => {
    signIn({ interactive: false }).catch(handleError);
  }, []);

  const handleSignInClick = async () => {
    setError(null);
    signIn({ interactive: true }).catch(handleError);
  };

  return (
    <div className={classes.root}>
      <Button
        className={classes.signInButton}
        color="primary"
        variant="contained"
        startIcon={<GoogleIcon />}
        onClick={handleSignInClick}
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

const signIn = async ({ interactive }: { interactive?: boolean }) => {
  const isFirefoxExtension = window.location.protocol === 'moz-extension:';
  if (isFirefoxExtension) {
    await launchFirefoxFlow({ interactive });
  } else {
    if (interactive) {
      const provider = new firebase.auth.GoogleAuthProvider();
      // There are issues with sign in mobile safari. See
      // https://github.com/firebase/firebase-js-sdk/issues/4256#issuecomment-852252857
      //
      // One of the suggested solutions is using
      // `signInWithRedirect` instead of `signInWithPopup`.
      await firebase.auth().signInWithRedirect(provider);
    } else {
      // We are not interested in the returned user object but calling
      // `getRedirectResult()` will throw a login error if there is
      // one.
      await firebase.auth().getRedirectResult();
    }
  }
};

/**
 * Firefox extensions cannot use firebase auth flow because it is not
 * possible to add "moz-extension:" as a valid redirect url to
 * firebase. We use a workaround flow that authenticates the user with
 * browser.identity.launchWebAuthFlow() and then passes the token to
 * firebase’s signInWithCredential.
 *
 * This function takes an `interactive` parameter that allows the flow
 * to finish with the user interaction. `interactive` should be set to
 * `true` when user launches the flow (button click) and should be
 * `false` otherwise (to check auth on start).
 */
const launchFirefoxFlow = async ({
  interactive,
}: {
  interactive?: boolean;
}) => {
  try {
    // webextension-polyfill can only be imported in extension context
    const browser = await import('webextension-polyfill');

    const nonce = Math.floor(Math.random() * 10000);
    const oauthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const redirectUrl = browser.identity.getRedirectURL();
    const responseUrl = await browser.identity.launchWebAuthFlow({
      url: `https://accounts.google.com/o/oauth2/v2/auth?response_type=id_token&nonce=${nonce}&scope=openid%20profile&client_id=${oauthClientId}&redirect_uri=${redirectUrl}`,
      interactive,
    });
    const idToken = responseUrl.split('id_token=')[1].split('&')[0];

    const credential = firebase.auth.GoogleAuthProvider.credential(idToken);
    await firebase.auth().signInWithCredential(credential);
  } catch (e: any) {
    if (e.name === 'Error' && e.message === 'Requires user interaction') {
      // Ignore it. We only use non-interactive flows as a check
    } else {
      throw e;
    }
  }
};
