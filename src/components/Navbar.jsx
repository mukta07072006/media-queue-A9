'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Menu, X, User, LogOut, BookOpen, PlusCircle, Users, Calendar } from 'lucide-react';

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = '/login';
  };

  // Navigation configurations
  const publicLinks = [
    { name: 'Home', href: '/' },
    { name: 'Tutors', href: '/tutors' },
  ];

  const privateLinks = [
    { name: 'Add Tutor', href: '/add-tutor', icon: PlusCircle },
    { name: 'My Tutors', href: '/my-tutors', icon: Users },
    { name: 'My Booked Sessions', href: '/my-booked-sessions', icon: Calendar },
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav className="bg-white border-b border-sky-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left Side: Logo & Main Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              <BookOpen className="h-6 w-6 text-sky-500" />
              <span>MediaQueue</span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive(link.href)
                      ? 'bg-sky-50 text-sky-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Render Private Links only if user is logged in */}
              {user && privateLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive(link.href)
                      ? 'bg-sky-50 text-sky-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side: Auth Action Elements */}
          <div className="hidden md:flex items-center">
            {isPending ? (
              <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
            ) : user ? (
              /* User Profile Menu Dropdown */
              <div className="relative ml-3" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-100"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover border border-sky-200"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-slate-700 hidden lg:block">{user.name}</span>
                </button>

                {/* Actual Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-sky-100 py-2 transform origin-top-right transition-all duration-200 z-50">
                    <div className="px-4 py-2 border-b border-slate-50">
                      <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span>My Profile</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Login/Register Guest CTA */ 
              <div className="flex items-center space-x-3">
                <Link href="/login" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 rounded-xl shadow-md shadow-sky-100 transition-all duration-200 transform active:scale-[0.98]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Mobile Menu Toggle Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-50 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-inner">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-base font-semibold ${
                isActive(link.href) ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {user && (
            <>
              <div className="my-2 border-t border-slate-100" />
              {privateLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-base font-semibold ${
                      isActive(link.href) ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 opacity-70" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
              <div className="my-2 border-t border-slate-100" />
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center space-x-2 px-4 py-2.5 text-base font-semibold text-red-600 hover:bg-red-50 rounded-xl"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </>
          )}

          {!user && !isPending && (
            <div className="pt-4 grid grid-cols-2 gap-3 border-t border-slate-100 mt-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex justify-center items-center py-2.5 text-center text-sm font-semibold border border-slate-200 text-slate-700 rounded-xl bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="flex justify-center items-center py-2.5 text-center text-sm font-semibold text-white bg-sky-500 rounded-xl"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;