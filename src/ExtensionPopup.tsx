import React, { Suspense } from 'react';
import 'webextension-polyfill';

import { useUser } from '@/context/userContext';
import firebase from '@/firebase/client';

const LoginScreen = React.lazy(() => import('./LoginScreen'));

export interface ExtensionPopupProps {}

const ExtensionPopup = ({}: ExtensionPopupProps) => {
  const { user, isLoading } = useUser();
  if (isLoading) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      {user ? (
        <>
          <button onClick={() => firebase.auth().signOut()}>
            {'Sign Out'}
          </button>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </>
      ) : (
        <LoginScreen />
      )}
    </Suspense>
  );
};

export default ExtensionPopup;