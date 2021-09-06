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

import Chrome from '@fortawesome/fontawesome-free/svgs/brands/chrome.svg';
import Firefox from '@fortawesome/fontawesome-free/svgs/brands/firefox.svg';
import Safari from '@fortawesome/fontawesome-free/svgs/brands/safari.svg';

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

export function ChromeIcon(
  props: Omit<React.ComponentPropsWithoutRef<'img'>, 'src'>
) {
  return <img src={Chrome} {...props} />;
}

export function FirefoxIcon(
  props: Omit<React.ComponentPropsWithoutRef<'img'>, 'src'>
) {
  return <img src={Firefox} {...props} />;
}

export function SafariIcon(
  props: Omit<React.ComponentPropsWithoutRef<'img'>, 'src'>
) {
  return <img src={Safari} {...props} />;
}
