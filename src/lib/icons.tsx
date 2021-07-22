import React from 'react';

import { SvgIconProps } from '@material-ui/core';
import PushPin from '@material-ui/icons/PushPin';

export { default as ArchiveIcon } from '@material-ui/icons/Done';
export { default as UnarchiveIcon } from '@material-ui/icons/RemoveDone';
export { default as DeleteIcon } from '@material-ui/icons/DeleteSharp';
export { default as LaterIcon } from '@material-ui/icons/WatchLater';
export { default as CloseIcon } from '@material-ui/icons/Close';
export { default as AddIcon } from '@material-ui/icons/Add';
export { default as LogoutIcon } from '@material-ui/icons/Logout';

export function PinIcon({
  unpin,
  ...props
}: SvgIconProps & { unpin?: boolean }) {
  return (
    <PushPin
      {...props}
      style={{
        transform: `rotate(${unpin ? 45 : 0}deg)`,
        transition: '0.1s transform',
        ...props.style,
      }}
    />
  );
}
