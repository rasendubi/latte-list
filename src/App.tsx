import React, { Suspense } from 'react';

import { useUser } from '@/context/userContext';

const LoginScreen = React.lazy(() => import('./LoginScreen'));
const SignedInApp = React.lazy(() => import('./SignedInApp'));

// import LoginScreen from './LoginScreen';
// import SignedInApp from './SignedInApp';

export interface AppProps {}

const App = ({}: AppProps) => {
  const { user, isLoading } = useUser();
  if (isLoading) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      {user ? <SignedInApp /> : <LoginScreen />}
    </Suspense>
  );
};

export default App;
