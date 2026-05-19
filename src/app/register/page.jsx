'use client';

import { authClient } from '@/lib/auth-client';
import { Button } from '@heroui/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';
import { FcGoogle } from "react-icons/fc";

const Signup = () => {


    const handleSubmit = async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.currentTarget);
      console.log(formData)
      const user = Object.fromEntries(formData.entries());
      
      console.log(user)
  
  
      
  
      const {data, error} = await authClient.signUp.email({
        email: user.email,
        password: user.password,
        name: user.name,
        photoUrl: user.photoUrl
      })
      
      if(data) {
        redirect('/login')
      }
  
    }

    const handleGoogleSignIn = async () => {
        await authClient.signIn.social({
        provider: "google",
      });
    }
  



  return (
   <div className='min-h-screen w-full flex bg-slate-50'>
      
  

      {/* Right Column: Form Panel (Takes full width on mobile, 50% width on desktop) */}
      <div className='w-full md:w-full flex items-center justify-center p-6 sm:p-12 bg-sky-50/20'>
        <div className='w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-sky-100/40 border border-sky-100/60'>
          
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Create your account</h2>
            <p className="text-sm text-slate-500 mt-1">Start learning today.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                name='name'
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all duration-200"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Photo URL</label>
              <input
                type="url"
                name='photoUrl'
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all duration-200"
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                name='email'
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                name='password'
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all duration-200"
                placeholder="At least 8 characters"
              />
            </div>

            <div className="text-xs text-slate-500 leading-relaxed pt-1">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-sky-600 hover:underline">Terms of Service</Link> and{' '}
              <Link href="/privacy" className="text-sky-600 hover:underline">Privacy Policy</Link>.
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-sky-200/60 hover:shadow-xl transition-all duration-200 transform active:scale-[0.98] mt-2"
            >
              Create Account
            </button>
          </form>

          <Button className={'mt-2 w-full rounded-lg'} variant="outline" onClick={handleGoogleSignIn}><FcGoogle /> 
            Sign in with Google
          </Button>

          {/* Footer Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Signup;