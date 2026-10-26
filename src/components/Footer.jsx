'use client';

import React from 'react';
import Link from 'next/link';
import { Parkinsans } from 'next/font/google';
import { BookOpen, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

const parkinsans = Parkinsans({
  subsets: ['latin'],
  display: 'swap',
});

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleSubmit = (e) => {
    e.preventDefault();
    e.currentTarget.reset();
  };

  return (
    <footer className={`${parkinsans.className} bg-green-950 text-white`}>

      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Brand */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2.5 w-max">
              
              <span className={`${parkinsans.className} text-2xl font-bold text-white`}>
                EduFlex
              </span>
            </Link>

            <p className={`${parkinsans.className} text-sm text-green-300 leading-relaxed max-w-sm`}>
              Connecting eager minds with professional mentors globally. Accelerate your academic goals with custom-tailored 1-on-1 mentorship sessions.
            </p>

            {/* Newsletter */}
            <div>
              <p className={`${parkinsans.className} text-xs font-bold tracking-widest uppercase text-green-400 mb-3`}>
                Stay in the loop
              </p>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  required
                  className={`${parkinsans.className} flex-1 bg-green-900 border border-green-700 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-green-500 focus:outline-none focus:border-lime-400 transition-colors`}
                />
                <button
                  type="submit"
                  className="w-10 h-10 rounded-full bg-lime-400 flex items-center justify-center shrink-0 hover:bg-lime-300 transition-colors"
                >
                  <ArrowRight size={16} className="text-green-900" />
                </button>
              </form>
            </div>
          </div>

          {/* Explore */}
          <div className="space-y-5">
            <h3 className={`${parkinsans.className} text-xs font-bold tracking-widest uppercase text-green-400`}>
              Explore
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Home', href: '/' },
                { label: 'Find Tutors', href: '/tutors' },
                { label: 'Pricing Structure', href: '/pricing' },
                { label: 'About Our Platform', href: '/about' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`${parkinsans.className} text-sm text-green-300 hover:text-lime-400 transition-colors`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-5">
            <h3 className={`${parkinsans.className} text-xs font-bold tracking-widest uppercase text-green-400`}>
              Support
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-green-900 border border-green-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail size={13} className="text-lime-400" />
                </div>
                <span className={`${parkinsans.className} text-sm text-green-300 break-all`}>
                  support@eduflex.com
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-green-900 border border-green-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone size={13} className="text-lime-400" />
                </div>
                <span className={`${parkinsans.className} text-sm text-green-300`}>
                  +880 1234-567890
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-green-900 border border-green-700 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={13} className="text-lime-400" />
                </div>
                <span className={`${parkinsans.className} text-sm text-green-300`}>
                  Chattogram, Bangladesh
                </span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-green-800" />

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className={`${parkinsans.className} text-xs text-green-500`}>
          © {currentYear} EduFlex. All rights reserved.
        </p>
        <div className="flex gap-6">
          {[
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Cookie Preferences', href: '/cookie-policy' },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`${parkinsans.className} text-xs text-green-500 hover:text-lime-400 transition-colors`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

    </footer>
  );
};

export default Footer;