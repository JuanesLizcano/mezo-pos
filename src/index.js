import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './services/analytics'; // inicializa PostHog al cargar la app

// Sentry solo se inicializa si hay DSN configurado en .env
if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn:              process.env.REACT_APP_SENTRY_DSN,
    environment:      process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    integrations:     [Sentry.browserTracingIntegration()],
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
