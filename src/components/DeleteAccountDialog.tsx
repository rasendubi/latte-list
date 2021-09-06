import React from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
} from '@material-ui/core';

export interface DeleteAccountDialogProps extends DialogProps {
  onClose?: () => void;
  onDelete?: () => void;
}

const DeleteAccountDialog = ({
  onDelete,
  ...props
}: DeleteAccountDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Deleting your account will delete all your stored items. This action
          cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button style={{ color: '#C56C6C' }} onClick={onDelete}>
          Delete account
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAccountDialog;
