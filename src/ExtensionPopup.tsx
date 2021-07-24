import React, { Suspense } from 'react';

import { useUser } from '@/context/userContext';

const LoginScreen = React.lazy(() => import('./LoginScreen'));

export interface ExtensionPopupProps {}

const ExtensionPopup = ({}: ExtensionPopupProps) => {
  const { user, isLoading } = useUser();
  if (isLoading) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      {user ? <pre>{JSON.stringify(user, null, 2)}</pre> : <LoginScreen />}
    </Suspense>
  );
};

export default ExtensionPopup;
