import React, { Suspense } from 'react';

import { useUser } from '@/context/userContext';
import UpdateSnackbar from '@/components/UpdateSnackbar';

const LoginScreen = React.lazy(() => import('./LoginScreen'));
const SignedInApp = React.lazy(() => import('./SignedInApp'));

export interface AppProps {}

const App = ({}: AppProps) => {
  const { user, isLoading } = useUser();
  if (isLoading) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      {user ? <SignedInApp /> : <LoginScreen />}
      <UpdateSnackbar />
    </Suspense>
  );
};

export default App;
