
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="max-w-md space-y-6">
        {/* Visual Badge */}
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-bold text-white shadow-sm">
          404
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Page Not Found
          </h1>
          <p className="text-base text-slate-600">
            Sorry, we couldn’t find the listing or page you’re looking for. It might have been moved or deleted.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}