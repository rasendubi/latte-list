import React from 'react';

import { Button, makeStyles, Paper, Typography } from '@material-ui/core';

import { useInstallPrompt } from '@/context/installPrompt';

export interface InstallBarProps {}

const InstallBar = ({}: InstallBarProps) => {
  const installPrompt = useInstallPrompt();
  const classes = useStyles();

  if (
    !installPrompt ||
    // TODO: rethink this.
    //
    // The assumption is that if share API is not supported, there is
    // no reason to install the app. But the user may still find it
    // valuable (e.g., to have an app shortcut).
    !('share' in navigator)
  ) {
    return null;
  }
  return (
    <Paper className={classes.root} elevation={2} square={true}>
      <Typography variant="subtitle2">
        {'Install app to save items by sharing'}
      </Typography>
      <Button
        disableElevation={true}
        color="secondary"
        variant="contained"
        onClick={() => installPrompt()}
      >
        {'Install'}
      </Button>
    </Paper>
  );
};

export default InstallBar;

const useStyles = makeStyles({
  root: {
    padding: 8,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
});
