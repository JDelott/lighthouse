'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'Default':
      default:
        return 'An error occurred during authentication.';
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-px h-6 bg-gradient-to-b from-blue-500 to-cyan-400 mx-auto mb-6"></div>
          <h1 className="text-3xl font-light text-black mb-4">
            Authentication Error
          </h1>
          <div className="w-16 h-px bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto mb-6"></div>
          <p className="text-gray-600 font-light leading-relaxed mb-8">
            {getErrorMessage(error)}
          </p>
          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="block w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-6 py-2 text-sm font-normal tracking-wide hover:from-blue-600 hover:to-cyan-500 transition-all duration-200"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="block w-full bg-white border border-gray-200 text-black px-6 py-2 text-sm font-normal tracking-wide hover:border-blue-500 transition-all duration-200"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
