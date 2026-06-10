'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Parkinsans } from 'next/font/google';
import { authClient } from '@/lib/auth-client';
import { Menu, X, User, LogOut, PlusCircle, Users, Calendar, ChevronDown, ArrowRight } from 'lucide-react';

const parkinsans = Parkinsans({
  subsets: ['latin'],
  display: 'swap',
});

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

  const publicLinks = [
    { name: 'Home', href: '/' },
    { name: 'Tutors', href: '/tutors' },
    { name: 'About Us', href: '/about' },
  ];

  const privateLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Users },
    { name: 'My Booked Sessions', href: '/my-booked-sessions', icon: Calendar },
  ];

  const isActive = (path) => pathname === path;

  // Links shown in center: always public + private if logged in
  const centerLinks = user ? [...publicLinks, ...privateLinks] : publicLinks;

  return (
    <nav className={`${parkinsans.className} bg-white border-b border-green-100 sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: Logo */}
          <Link
            href="/"
            className={`${parkinsans.className} text-xl font-bold text-green-900 tracking-tight shrink-0`}
          >
            EduFlex
          </Link>

          {/* Center: Nav Links (desktop) */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {centerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${parkinsans.className} px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-lime-300 text-green-900'
                    : 'text-green-800 hover:bg-green-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right: Auth (desktop) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isPending ? (
              <div className="h-8 w-20 rounded-full bg-green-100 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`${parkinsans.className} flex items-center gap-2 px-3 py-1.5 rounded-full border-[1.5px] border-green-200 hover:border-green-400 hover:bg-green-50 transition-all`}
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-lime-300 text-green-900 flex items-center justify-center text-xs font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-green-900 hidden lg:block">
                    {user.name}
                  </span>
                  <ChevronDown size={14} className="text-green-600" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border-[1.5px] border-green-100 shadow-lg py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-green-50">
                      <p className={`${parkinsans.className} text-sm font-bold text-green-900 truncate`}>
                        {user.name}
                      </p>
                      <p className={`${parkinsans.className} text-xs text-green-500 truncate`}>
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className={`${parkinsans.className} flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-800 hover:bg-green-50 transition-colors`}
                    >
                      <User size={15} className="text-green-500" />
                      My Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className={`${parkinsans.className} w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-green-50`}
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={`${parkinsans.className} px-4 py-2 text-sm font-semibold text-green-800 hover:text-green-900 transition-colors`}
                >
                  Sign In
                </Link>
                 <Link
              href="/register"
                onClick={() => setIsOpen(false)}
                 className={`px-4 justify-between py-1 items-center cursor-pointer bg-emerald-600 flex gap-8 hover:gap-10 transition-all text-white font-semibold rounded-full ${parkinsans.className}`}>Register <div
            className='h-8 w-8 bg-lime-300 rounded-full flex justify-center items-center p-2'>
                <ArrowRight
            size={25}
            color='#000' 
            />
                </div> </Link>
                
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-green-800 hover:bg-green-50 transition-colors"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-green-100 bg-white px-4 pt-3 pb-5 space-y-1">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`${parkinsans.className} block px-4 py-2.5 rounded-2xl text-sm font-semibold transition-colors ${
                isActive(link.href)
                  ? 'bg-lime-300 text-green-900'
                  : 'text-green-800 hover:bg-green-50'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {user && (
            <>
              <div className="my-2 border-t border-green-100" />
              {privateLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`${parkinsans.className} flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-colors ${
                      isActive(link.href)
                        ? 'bg-lime-300 text-green-900'
                        : 'text-green-800 hover:bg-green-50'
                    }`}
                  >
                    <Icon size={16} className="opacity-60" />
                    {link.name}
                  </Link>
                );
              })}
              <div className="my-2 border-t border-green-100" />
              <button
                onClick={() => { setIsOpen(false); handleLogout(); }}
                className={`${parkinsans.className} w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-2xl transition-colors`}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          )}

          {!user && !isPending && (
            <div className="pt-3 grid grid-cols-2 gap-3 border-t border-green-100 mt-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className={`${parkinsans.className} flex justify-center py-2.5 text-sm font-semibold text-green-800 border-[1.5px] border-green-200 rounded-full hover:bg-green-50 transition-colors`}
              >
                Sign In
              </Link>
              
              <Link
              href="/register"
                onClick={() => setIsOpen(false)}
                 className={`px-5 justify-between py-2 items-center cursor-pointer bg-emerald-600 flex gap-8 hover:gap-10 transition-all text-white font-semibold rounded-full ${parkinsans.className}`}>Register <div
            className='h-8 w-8 bg-lime-300 rounded-full flex justify-center items-center p-2'>
                <ArrowRight
            size={25}
            color='#000' 
            />
                </div> </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;