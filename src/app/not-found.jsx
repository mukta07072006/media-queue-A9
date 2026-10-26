import Link from 'next/link';
import { Parkinsans } from 'next/font/google';
import { FiCompass } from 'react-icons/fi';

// If you already export `parkinsans` from somewhere else, import that instead of redefining it here.
const parkinsans = Parkinsans({ subsets: ['latin'], display: 'swap' });

// Same lime/green gradient family as the tutor card covers
const COVER = {
  backgroundImage: [
    'radial-gradient(circle at 18% 30%, #facc15 0%, transparent 45%)',
    'radial-gradient(circle at 85% 20%, #0f766e 0%, transparent 55%)',
    'radial-gradient(circle at 60% 95%, #4ade80 0%, transparent 60%)',
    'linear-gradient(135deg, #d9f99d, #4ade80)',
  ].join(','),
};

export default function NotFound() {
  return (
    <main
      className={`${parkinsans.className} flex min-h-[80vh] items-center justify-center bg-[#f3f6f2] px-4 py-16`}
    >
      <div className="w-full max-w-[400px] rounded-[2rem] bg-white p-2.5 shadow-[0_10px_30px_-12px_rgba(20,83,45,0.25)] ring-1 ring-green-900/5">
        {/* Cover, avatar, error pill */}
        <div className="relative">
          <div className="h-36 rounded-3xl" style={COVER} />

          <div
            aria-hidden="true"
            className="absolute bottom-0 left-4 flex h-[68px] w-[68px] translate-y-1/2 items-center justify-center rounded-full bg-lime-100 text-3xl font-bold text-green-800 ring-[5px] ring-white"
          >
            ?
          </div>

          <span className="absolute bottom-0 right-3 inline-flex translate-y-1/2 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-bold text-green-950 shadow-[0_4px_14px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
            <FiCompass className="h-4 w-4 text-lime-600" />
            Error 404
          </span>
        </div>

        {/* Message */}
        <div className="px-3 pb-3 pt-11">
          <h1 className="text-2xl font-bold leading-tight text-green-950">Page not found</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            The link may be broken, or the page may have moved. Head back home or find a tutor
            instead.
          </p>

          <div className="mt-6 space-y-3">
            <Link
              href="/"
              className="block w-full rounded-2xl bg-lime-300 py-3.5 text-center text-sm font-bold text-green-950 transition-colors hover:bg-lime-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-500"
            >
              Back to home
            </Link>
            <Link
              href="/tutors"
              className="block w-full rounded-2xl border border-green-100 bg-gradient-to-b from-white to-green-50 py-3.5 text-center text-sm font-bold text-green-950 transition-colors hover:border-lime-300 hover:from-lime-50 hover:to-lime-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-500"
            >
              Find a tutor
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}