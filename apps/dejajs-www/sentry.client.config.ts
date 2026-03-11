import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust the tracesSampleRate in production as needed
  tracesSampleRate: 1.0,

  // Set to false in production or use a lower value
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration(),
  ],

  // Setting this option to true will print useful information to the console while setting up Sentry.
  debug: false,
});
