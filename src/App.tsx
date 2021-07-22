import React from 'react';

import { useLocation, useHistory } from 'react-router-dom';

import Home from '@/Home';
import AddDialog from '@/components/AddDialog';
import ReviewDialog from '@/ReviewDialog';
import { useUser } from '@/context/userContext';
import LoginScreen from './LoginScreen';

export interface AppProps {}

const App = ({}: AppProps) => {
  const location = useLocation();
  const history = useHistory();

  const { user, isLoading } = useUser();
  if (isLoading) {
    return null;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <>
      <Home />
      {location.pathname === '/add' && (
        <AddDialog fullScreen={true} open={true} />
      )}
      {location.pathname === '/review' && (
        <ReviewDialog
          fullScreen={true}
          open={true}
          onClose={() => history.replace('/')}
        />
      )}
    </>
  );
};

export default App;
