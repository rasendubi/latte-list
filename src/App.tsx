import React from 'react';

import { BrowserRouter, Switch, Route } from 'react-router-dom';

import ThemeProvider from '@material-ui/styles/ThemeProvider';
import CssBaseline from '@material-ui/core/CssBaseline';

import UserProvider from '@/context/userContext';
import theme from '@/theme';

import Home from '@/Home';
import AddDialog from '@/components/AddDialog';

export interface AppProps {}

const App = ({}: AppProps) => {
  return (
    <UserProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Switch>
            <Route path="/add">
              <AddDialog fullScreen={true} open={true} />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </BrowserRouter>
      </ThemeProvider>
    </UserProvider>
  );
};

export default App;
