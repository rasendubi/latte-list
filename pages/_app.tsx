import React from 'react';
import type { AppProps } from 'next/app';

import UserProvider from '@/context/userContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Component {...pageProps} />
      <style jsx global>
        {`
          html,
          body {
            margin: 0;
            font-family: 'Noto Sans', sans-serif;
          }
          * {
            box-sizing: border-box;
          }
        `}
      </style>
    </UserProvider>
  );
}
