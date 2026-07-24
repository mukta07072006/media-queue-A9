'use client';

import React, { useEffect, useState } from 'react';
import { Parkinsans } from 'next/font/google';
import { Highlight } from '@/components/reusablecomp/Highlight';
import { Mail, Lock, ArrowRight, LogIn, Sparkles, CircleCheck } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { redirect, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/navigation';
import { TextShimmer } from '@/components/ui/text-shimmer';
import toast from 'react-hot-toast';

const parkinsans = Parkinsans({ subsets: ['latin'], display: 'swap' });

export default function Login() {

   const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();
    const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fromEmailVerification, setFromEmailVerification] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
  });


 

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setFromEmailVerification(true);
   
      window.history.replaceState(null, '', '/login');
    }
  }, [searchParams]);


  useEffect(() => {
      if (!isPending && session) {
        router.replace('/'); 
      }
    }, [session, isPending, router]);
  
    
    if (isPending) {
      return (
        <div className={`${parkinsans.className} min-h-screen flex items-center justify-center`}>
          <TextShimmer>Checking Auth....</TextShimmer>
        </div>
      );
    }
  
    if (session) {
      return null; 
    }

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data, error } = await authClient.signIn.email({
      email: form.email,
      password: form.password,
      callbackURL: `${typeof window !== 'undefined' ? window.location.origin : ''}/`,
    });

    if (error) {
      setIsSubmitting(false);
      alert(error.message || 'Login failed');
      return;
    }

    if (data) {
      redirect('/');
    }
  };

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
    });
  };

  const labelCls = `${parkinsans.className} block text-xs font-bold text-green-600 uppercase tracking-widest mb-2`;
  const inputCls = `${parkinsans.className} w-full px-4 py-3 pl-11 rounded-2xl bg-green-50 border-[1.5px] border-green-200 text-green-900 placeholder-green-300 focus:outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-100 transition-all text-sm font-semibold`;

  return (
    <main className={`${parkinsans.className} min-h-screen bg-green-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[360px_1fr] gap-8 items-start">

          {/* ═══════ LEFT PANEL ═══════ */}
          <div className="lg:sticky lg:top-24 bg-green-950 rounded-3xl p-8 text-white space-y-8">
            <div>
              <span className={`${parkinsans.className} inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-lime-400/20 text-lime-300 border border-lime-400/30 mb-4`}>
                Welcome Back
              </span>
              <h1 className={`${parkinsans.className} text-4xl font-bold leading-tight`}>
                Continue <Highlight>Learning.</Highlight><br />
                Pick Up Where You Left Off.
              </h1>
              <p className={`${parkinsans.className} text-green-400 text-sm mt-4 leading-relaxed`}>
                Sign in to access your dashboard, track progress, and connect with your favorite educators.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Secure Login', icon: LogIn, active: true },
                { label: 'Resume Learning', icon: Sparkles, active: false },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    s.active ? 'bg-lime-300/20 border border-lime-400/30' : 'opacity-40'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    s.active ? 'bg-lime-300/30' : 'bg-white/10'
                  }`}>
                    <s.icon size={15} className={s.active ? 'text-lime-400' : 'text-white/40'} />
                  </div>
                  <span className={`${parkinsans.className} text-sm font-semibold ${s.active ? 'text-white' : 'text-white/40'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ═══════ RIGHT FORM ═══════ */}
          <div className="bg-white border-[1.5px] border-green-100 rounded-3xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Header */}
              <div>
                <p className={`${parkinsans.className} text-[11px] font-bold text-green-500 uppercase tracking-widest mb-1`}>
                  Sign In
                </p>
                <h2 className={`${parkinsans.className} text-3xl font-bold text-green-900`}>
                  Welcome Back
                </h2>
                <p className={`${parkinsans.className} text-sm text-green-400 mt-1`}>
                  Enter your credentials to access your account.
                </p>
              </div>

              <div className="space-y-4">
                  {fromEmailVerification && (
                  <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    Your email has been successfully verified! Please log in to continue. <CircleCheck />
                  </div>
                  )}
              </div>

              {/* Fields */}
              <div className="space-y-5">
                <div>
                  <label className={labelCls}>Email Address *</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-300" />
                    <input
                      type="email"
                      className={inputCls}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Password *</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-300" />
                    <input
                      type="password"
                      className={inputCls}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) => setField('password', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded-lg border-green-300 text-lime-500 focus:ring-lime-400"
                  />
                  <span className={`${parkinsans.className} text-xs font-semibold text-green-600`}>
                    Remember me
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className={`${parkinsans.className} text-xs font-bold text-lime-600 hover:text-lime-700 transition-colors`}
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`${parkinsans.className} w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-green-900 bg-lime-300 border-[1.5px] border-lime-400 hover:bg-lime-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? 'Signing In…' : 'Sign In'}
                <ArrowRight size={16} />
              </button>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className={`${parkinsans.className} w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-green-700 bg-green-50 border-[1.5px] border-green-200 hover:border-green-400 hover:bg-green-100 transition-all`}
              >
                <FcGoogle size={18} />
                Sign in with Google
              </button>

              {/* Footer */}
              <div className="pt-4 border-t border-green-100 text-center">
                <p className={`${parkinsans.className} text-sm text-green-600`}>
                  Don't have an account?{' '}
                  <Link
                    href="/register"
                    className="font-bold text-lime-600 hover:text-lime-700 transition-colors"
                  >
                    Create a new account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}