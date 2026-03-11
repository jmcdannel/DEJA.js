import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <h1 className="text-8xl font-extrabold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
        404
      </h1>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Page Not Found
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
        <Link
          href="/"
          className="inline-block px-5 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition dark:bg-blue-500 dark:hover:bg-blue-400"
        >
          Back to Home
        </Link>
        <Link
          href="/docs"
          className="inline-block px-5 py-3 bg-transparent text-blue-600 dark:text-blue-400 rounded-lg font-medium border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900 transition"
        >
          View Docs
        </Link>
      </div>
    </div>
  );
}
