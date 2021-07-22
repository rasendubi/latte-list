import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import ThemeProvider from '@material-ui/styles/ThemeProvider';
import CssBaseline from '@material-ui/core/CssBaseline';

import UserProvider from '@/context/userContext';
import theme from '@/theme';
import { InstallPromptProvider } from './context/installPrompt';
import { ServiceWorkerProvider } from './context/serviceWorker';

export interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  return (
    <ServiceWorkerProvider scriptUrl="/sw.js">
      <InstallPromptProvider>
        <UserProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>{children}</BrowserRouter>
          </ThemeProvider>
        </UserProvider>
      </InstallPromptProvider>
    </ServiceWorkerProvider>
  );
};

export default Wrapper;
