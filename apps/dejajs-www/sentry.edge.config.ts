import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust the tracesSampleRate in production as needed
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while setting up Sentry.
  debug: false,
});
