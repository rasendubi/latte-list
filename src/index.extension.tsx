import React from 'react';
import ReactDOM from 'react-dom';

import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

import Wrapper from './Wrapper';
import ExtensionPopup from '@/extension/ExtensionPopup';

Sentry.init({
  dsn: process.env.SENTRY_EXTENSION_DSN,
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

ReactDOM.render(
  <Wrapper>
    <ExtensionPopup />
  </Wrapper>,
  document.getElementById('root')
);
