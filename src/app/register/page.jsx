'use client';

import React, { useEffect, useState } from 'react';
import { Parkinsans } from 'next/font/google';
import { Highlight } from '@/components/reusablecomp/Highlight';
import { User, Mail, Lock, ArrowRight, CheckCircle, MailCheck, RefreshCw } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation'; 
import Link from 'next/link';
import { TextShimmer } from '@/components/ui/text-shimmer';

const parkinsans = Parkinsans({ subsets: ['latin'], display: 'swap' });

export default function SignupPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

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

    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await authClient.signUp.email({
      email: form.email,
      password: form.password,
      name: form.name,
      role: 'student',
    });

    if (error) {
      setIsSubmitting(false);
      alert(error.message || 'Signup failed');
      return;
    }

    if (data) {
      setIsSubmitting(false);
      setIsSent(true);
    }
  };

  if (isSent) {
    return (
      <div className={`${parkinsans.className} min-h-screen flex items-center justify-center p-4 bg-green-50`}>
        <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl text-center space-y-6">
          {/* Animated / Highlighted Icon Badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lime-50 dark:bg-blue-950/50 text-green-900 dark:text-green-900 ring-8 ring-lime-50/50 dark:ring-green-950/20">
            <MailCheck className="w-8 h-8" />
          </div>

          {/* Heading & Information */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Check your email
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We’ve sent a verification link to{' '}
              <span className="font-semibold text-zinc-900 dark:text-zinc-200 break-all">
                {form.email || 'your email address'}
              </span>
              .
            </p>
          </div>

          {/* Spam Notice Box */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
            Can't find it? Be sure to check your{' '}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Spam</span> or{' '}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Junk</span> folder.
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => authClient.sendVerificationEmail({ email: form.email })}
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              Resend verification email
            </button>

            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-white text-green-900 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 rounded-xl transition-colors duration-200 shadow-sm"
            >
              Proceed to Login
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const labelCls = `${parkinsans.className} block text-xs font-bold text-green-600 uppercase tracking-widest mb-2`;
  const inputCls = `${parkinsans.className} w-full px-4 py-3 rounded-2xl bg-green-50 border-[1.5px] border-green-200 text-green-900 placeholder-green-300 focus:outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-100 transition-all text-sm font-semibold`;

  return (
    <main className={`${parkinsans.className} min-h-screen bg-green-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[360px_1fr] gap-8 items-start">

          {/* LEFT PANEL */}
          <div className="lg:sticky lg:top-24 bg-green-950 rounded-3xl p-8 text-white space-y-8">
            <div>
              <span className={`${parkinsans.className} inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-lime-400/20 text-lime-300 border border-lime-400/30 mb-4`}>
                Join as Student
              </span>
              <h1 className={`${parkinsans.className} text-4xl font-bold leading-tight`}>
                Start <Highlight>Learning.</Highlight><br />
                Shape Your Future.
              </h1>
              <p className={`${parkinsans.className} text-green-400 text-sm mt-4 leading-relaxed`}>
                Create your account in seconds and connect with top educators to accelerate your academic journey.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Create Account', icon: User, active: true },
                { label: 'Start Learning', icon: CheckCircle, active: false },
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

          {/* RIGHT FORM */}
          <div className="bg-white border-[1.5px] border-green-100 rounded-3xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <p className={`${parkinsans.className} text-[11px] font-bold text-green-500 uppercase tracking-widest mb-1`}>
                  Get Started
                </p>
                <h2 className={`${parkinsans.className} text-3xl font-bold text-green-900`}>
                  Create Your Account
                </h2>
                <p className={`${parkinsans.className} text-sm text-green-400 mt-1`}>
                  Fill in your details below to get started.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-300" />
                    <input
                      className={`${inputCls} pl-11`}
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Email Address *</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-300" />
                    <input
                      type="email"
                      className={`${inputCls} pl-11`}
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
                      className={`${inputCls} pl-11`}
                      placeholder="At least 8 characters"
                      value={form.password}
                      onChange={(e) => setField('password', e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Confirm Password *</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-300" />
                    <input
                      type="password"
                      className={`${inputCls} pl-11`}
                      placeholder="Re-enter your password"
                      value={form.confirmPassword}
                      onChange={(e) => setField('confirmPassword', e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                </div>
              </div>

              <div className="text-xs text-green-400 leading-relaxed">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="text-lime-600 hover:underline font-semibold">Terms of Service</Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-lime-600 hover:underline font-semibold">Privacy Policy</Link>.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`${parkinsans.className} w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-green-900 bg-lime-300 border-[1.5px] border-lime-400 hover:bg-lime-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? 'Creating…' : 'Create Account'}
                <ArrowRight size={16} />
              </button>

              <div className="pt-4 border-t border-green-100 text-center">
                <p className={`${parkinsans.className} text-sm text-green-600`}>
                  Already have an account?{' '}
                  <Link href="/login" className="font-bold text-lime-600 hover:text-lime-700 transition-colors">
                    Sign in
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