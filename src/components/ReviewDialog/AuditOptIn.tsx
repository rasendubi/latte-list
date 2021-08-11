import React from 'react';
import {
  Button,
  createStyles,
  makeStyles,
  Typography,
} from '@material-ui/core';

import { saveAuditOptIn } from '@/lib/audit';

export interface AuditOptInProps {
  onClose?: () => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    root: {},
    buttonGroup: {
      display: 'flex',
      justifyContent: 'center',
    },
    button: {
      margin: 8,
    },
  })
);

const AuditOptIn = ({ onClose }: AuditOptInProps) => {
  const classes = useStyles();
  const finish = (decision: boolean) => {
    saveAuditOptIn(decision);
    onClose?.();
  };
  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom={true}>
        Would you like to contribute?
      </Typography>
      <Typography paragraph={true}>
        The review scheduling algorithm is currently very simple. I want to
        improve it, but I need real data from real people using it.
      </Typography>
      <Typography paragraph={true}>
        If you want, the statistics on your reading process can be uploaded for
        analysis. The data will be used for algorithm development only.
      </Typography>
      <Typography paragraph={true}>
        You can always change your decision in the settings.
      </Typography>
      <div className={classes.buttonGroup}>
        <Button
          className={classes.button}
          color="primary"
          variant="contained"
          onClick={() => finish(true)}
        >
          {'Yes'}
        </Button>
        <Button
          className={classes.button}
          color="primary"
          variant="contained"
          onClick={() => finish(false)}
        >
          {'No'}
        </Button>
      </div>
    </div>
  );
};

export default AuditOptIn;
