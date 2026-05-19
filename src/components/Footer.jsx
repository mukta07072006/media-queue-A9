'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Github, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';


const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    console.log('Subscribed email:', formData.get('email'));
    e.currentTarget.reset();
  };

  return (
    <footer className="bg-white border-t border-sky-100 text-slate-600">
      {/* Top Main Section */}
      <div className="max-w-[100vw] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">

          {/* Brand Column (Takes 2 widths on larger grids) */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent w-max">
              <BookOpen className="h-6 w-6 text-sky-500" />
              <span>MediaQueue</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              Connecting eager minds with professional mentors globally. Accelerate your academic goals with custom tailored 1-on-1 mentorship sessions.
            </p>

          </div>

          {/* Quick Explore Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 tracking-wider uppercase">Explore</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-sky-500 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/tutors" className="hover:text-sky-500 transition-colors">Find Tutors</Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-sky-500 transition-colors">Pricing Structure</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-sky-500 transition-colors">About Our Platform</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 tracking-wider uppercase">Support</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2.5">
                <Mail className="h-4 w-4 mt-0.5 text-sky-500 shrink-0" />
                <span className="text-slate-500 break-all">support@eduflex.com</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <Phone className="h-4 w-4 mt-0.5 text-sky-500 shrink-0" />
                <span className="text-slate-500">+880 1234-567890</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 mt-0.5 text-sky-500 shrink-0" />
                <span className="text-slate-500">Chattogram, Bangladesh</span>
              </li>
            </ul>
          </div>

          

        </div>
      </div>

      {/* Bottom Legal Disclaimer Section */}
      <div className="bg-slate-50 border-t border-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div>
            © {currentYear} MediaQueue. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
            <Link href="/cookie-policy" className="hover:text-slate-600 transition-colors">Cookie Preferences</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;