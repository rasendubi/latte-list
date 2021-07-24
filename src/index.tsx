import React from 'react';
import ReactDOM from 'react-dom';

import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

import Wrapper from './Wrapper';
import App from './App';
import { ServiceWorkerProvider } from './context/serviceWorker';
import { InstallPromptProvider } from './context/installPrompt';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

ReactDOM.render(
  <Sentry.ErrorBoundary
    showDialog={true}
    dialogOptions={{
      title: 'It looks like Readily is having issues.',
      subtitle: 'The author has been notified.',
    }}
    fallback="An error has occurred"
  >
    <ServiceWorkerProvider scriptUrl="/sw.js">
      <InstallPromptProvider>
        <Wrapper>
          <App />
        </Wrapper>
      </InstallPromptProvider>
    </ServiceWorkerProvider>
  </Sentry.ErrorBoundary>,
  document.getElementById('root')
);
