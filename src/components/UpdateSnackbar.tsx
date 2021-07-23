import React from 'react';

import { Button, IconButton, Snackbar } from '@material-ui/core';

import { CloseIcon } from '@/lib/icons';
import { useServiceWorker } from '@/context/serviceWorker';

export interface UpdateSnackbarProps {}

const UpdateSnackbar = ({}: UpdateSnackbarProps) => {
  const { newServiceWorkerAvailable, skipWaiting } = useServiceWorker();
  const [updateDismissed, setUpdateDismissed] = React.useState(false);
  return (
    <Snackbar
      open={newServiceWorkerAvailable && !updateDismissed}
      message="New release is available"
      action={
        <>
          <Button
            disableElevation={true}
            variant="contained"
            color="secondary"
            size="small"
            onClick={skipWaiting}
          >
            {'Update'}
          </Button>
          <IconButton color="inherit" onClick={() => setUpdateDismissed(true)}>
            <CloseIcon />
          </IconButton>
        </>
      }
    />
  );
};

export default UpdateSnackbar;
