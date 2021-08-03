import React, { Suspense } from 'react';
import 'webextension-polyfill';

import { useUser } from '@/context/userContext';
import Capture from '@/extension/Capture';

const LoginScreen = React.lazy(() => import('@/LoginScreen'));

export interface ExtensionPopupProps {}

const ExtensionPopup = ({}: ExtensionPopupProps) => {
  const { user, isLoading } = useUser();
  if (isLoading) {
    return null;
  }

  return (
    <Suspense fallback={null}>{user ? <Capture /> : <LoginScreen />}</Suspense>
  );
};

export default ExtensionPopup;
