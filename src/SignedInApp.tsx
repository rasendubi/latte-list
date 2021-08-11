import React from 'react';

import { useLocation, useHistory } from 'react-router-dom';

import Home from '@/Home';
import AddPage from '@/components/AddPage';
import ReviewDialog from '@/components/ReviewDialog';
import SettingsPage from './SettingsPage';

export interface AppProps {}

const SignedInApp = ({}: AppProps) => {
  const location = useLocation();
  const history = useHistory();

  return location.pathname === '/settings' ? (
    <SettingsPage />
  ) : (
    <>
      <Home />
      {location.pathname === '/add' && <AddPage open={true} />}
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

export default SignedInApp;
