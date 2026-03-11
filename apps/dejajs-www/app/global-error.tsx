"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-gray-50 text-gray-800 transition-colors duration-200 dark:bg-gray-950 dark:text-gray-50 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="fixed w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[100px] -top-[100px] left-[50%] translate-x-[-50%]"></div>
          <div className="fixed w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[80px] -bottom-[-10%] -right-[200px]"></div>
          <div className="fixed w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[90px] top-[50%] left-[20%]"></div>
        </div>
        <main className="max-w-5xl mx-auto px-6 py-10 flex flex-col items-center justify-center min-h-screen text-center space-y-6">
          <h1 className="text-8xl font-extrabold bg-gradient-to-r from-purple-500 to-violet-400 bg-clip-text text-transparent">
            Error
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Something went wrong
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
            An unexpected error occurred. Please try again, or return to the home page.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <button
              onClick={() => reset()}
              className="inline-block px-5 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition dark:bg-blue-500 dark:hover:bg-blue-400 cursor-pointer"
            >
              Try Again
            </button>
            <a
              href="/"
              className="inline-block px-5 py-3 bg-transparent text-blue-600 dark:text-blue-400 rounded-lg font-medium border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900 transition"
            >
              Back to Home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
