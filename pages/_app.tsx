import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';

import ThemeProvider from '@material-ui/styles/ThemeProvider';

import UserProvider from '@/context/userContext';
import theme from '@/theme';
import { CssBaseline } from '@material-ui/core';

export default function App({ Component, pageProps }: AppProps) {
  React.useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }
  }, []);

  React.useEffect(() => {
    const listener = (e: Event) => {
      console.log('beforeinstallprompt');
      (e as any).prompt();
      // alert('beforeinstallprompt');
    };
    window.addEventListener('beforeinstallprompt', listener);
    return () => window.removeEventListener('beforeinstallprompt', listener);
  }, []);

  return (
    <UserProvider>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </UserProvider>
  );
}
