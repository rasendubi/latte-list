import React from 'react';

import { useLocation, useHistory } from 'react-router-dom';

import { AppBar, Button, Toolbar, Typography } from '@material-ui/core';

import Home from '@/Home';
import AddDialog from '@/components/AddDialog';
import ReviewDialog from '@/ReviewDialog';
import { useReviewItem } from './lib/useReviewItem';

export interface AppProps {}

const App = ({}: AppProps) => {
  const location = useLocation();
  const history = useHistory();

  const { item: reviewItem } = useReviewItem(5000);

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography style={{ flexGrow: 1 }}>{'Home'}</Typography>
          {reviewItem && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => history.push('/review')}
            >
              {'Review'}
            </Button>
          )}
        </Toolbar>
      </AppBar>
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
