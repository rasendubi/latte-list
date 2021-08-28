import React from 'react';

import { createStyles, makeStyles } from '@material-ui/core';

import SignInButton from './landing/SignInButton';

export interface LoginScreenProps {}

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      width: 320,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
  })
);

const LoginScreen = ({}: LoginScreenProps) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <SignInButton />
    </div>
  );
};

export default LoginScreen;
