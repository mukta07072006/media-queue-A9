'use client';

import React, { useEffect, useState } from 'react';
import { Parkinsans } from 'next/font/google';
import { Highlight } from '@/components/reusablecomp/Highlight';
import {
  ArrowLeft, BookOpen, MapPin, Calendar, Clock,
  GraduationCap, Star, TrendingUp, Award, ChevronRight,
  Sparkles, Phone, Mail, UserCheck, Loader2,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { API_URL } from '@/lib/api';
import Link from 'next/link';

const parkinsans = Parkinsans({ subsets: ['latin'], display: 'swap' });

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState('sessions');
  const [userProfile, setUserProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const session = authClient.useSession();
  const userd = session.data?.user;

  useEffect(() => {
    if (!userd?.email) return;
    fetch(`${API_URL}/api/auth/user/${userd.email}`)
      .then(r => r.json())
      .then(d => setUserProfile(d?.[0]));
  }, [session]);

  useEffect(() => {
    if (!userd?.id) return;
    fetch(`${API_URL}/api/bookings/mine?studentId=${userd.id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => setBookings(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userd?.id]);

  if (!session.data) {
    return (
      <div className={`${parkinsans.className} min-h-screen flex items-center justify-center bg-green-50`}>
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto">
            <UserCheck size={28} className="text-green-400" />
          </div>
          <p className="text-green-700 font-semibold text-sm">Please log in to view your profile.</p>
          <Link href="/login" className="inline-flex items-center gap-1.5 text-lime-600 font-bold text-sm hover:text-lime-700 transition-colors">
            Sign In <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: BookOpen, label: 'Sessions', value: bookings.length, color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200' },
    { icon: TrendingUp, label: 'Hours Learned', value: Math.floor(bookings.reduce((a, b) => a + (b.hours || 1), 0)), color: 'text-lime-700', bg: 'bg-lime-100', border: 'border-lime-200' },
    { icon: Award, label: 'Streak', value: '12d', color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200' },
  ];

  return (
    <div className={`${parkinsans.className} min-h-screen bg-green-50`}>

      {/* ═══════ TOP NAV ═══════ */}
      <header className="sticky top-0 z-50 bg-green-50/80 backdrop-blur-xl border-b border-green-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 font-bold text-sm transition-colors">
            <ArrowLeft size={18} />
            Back
          </Link>
          <span className="text-[11px] font-bold text-green-500 uppercase tracking-widest">My Profile</span>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 pb-20 space-y-6">

        {/* ═══════ HERO CARD ═══════ */}
        <div className="bg-green-950 rounded-3xl p-8 text-white relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-lime-400/5 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-3xl bg-green-800 border-2 border-lime-400/30 p-1">
                <img
                  src={userProfile?.photoUrl || "d"}
                  alt="avatar"
                  className="w-full h-full rounded-2xl object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-lime-400 border-[3px] border-green-950 rounded-full" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-lime-400/20 text-lime-300 border border-lime-400/30 mb-3">
                <Sparkles size={10} /> Student
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-2">
                {userProfile?.name ?? userd?.name ?? 'Your Name'}
              </h1>
              <div className="flex flex-wrap gap-4 text-[13px] text-green-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} className="text-lime-400" />
                  {userd?.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-lime-400" />
                  {userProfile?.address ?? 'Location not set'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={13} className="text-lime-400" />
                  {userProfile?.phone ?? 'N/A'}
                </span>
              </div>
            </div>

            {/* Edit Button */}
            <button className="shrink-0 px-5 py-2.5 rounded-2xl bg-lime-300 text-green-900 font-bold text-[13px] hover:bg-lime-400 transition-colors">
              Edit Profile
            </button>
          </div>

          {/* Stats Row */}
          <div className="relative z-10 mt-8 pt-6 border-t border-green-800/50 grid grid-cols-3 gap-4">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${s.bg} ${s.color} mb-2 border ${s.border}`}>
                  <s.icon size={18} />
                </div>
                <p className="text-2xl font-extrabold text-white leading-none">{s.value}</p>
                <p className="text-[11px] text-green-500 font-semibold mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════ TABS ═══════ */}
        <div className="flex gap-2">
          {[
            { id: 'sessions', label: 'My Sessions', icon: BookOpen },
            { id: 'tutors', label: 'My Tutors', icon: GraduationCap },
            { id: 'progress', label: 'Progress', icon: TrendingUp },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[13px] font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-lime-300 text-green-900 border-[1.5px] border-lime-400'
                  : 'bg-white text-green-600 border-[1.5px] border-green-100 hover:border-green-300'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════ CONTENT ═══════ */}
        {activeTab === 'sessions' && (
          loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="text-green-400 animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white border-[1.5px] border-green-100 rounded-3xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} className="text-green-300" />
              </div>
              <h3 className="text-lg font-bold text-green-900 mb-1">No sessions yet</h3>
              <p className="text-sm text-green-400 mb-4">Book a tutor to start your learning journey</p>
              <Link href="/tutors" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-lime-300 text-green-900 font-bold text-sm hover:bg-lime-400 transition-colors">
                Find Tutors <ChevronRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map(b => <BookingCard key={b._id} booking={b} />)}
            </div>
          )
        )}

        {activeTab === 'tutors' && (
          <div className="bg-white border-[1.5px] border-green-100 rounded-3xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={28} className="text-green-300" />
            </div>
            <h3 className="text-lg font-bold text-green-900 mb-1">Coming Soon</h3>
            <p className="text-sm text-green-400">Your favorite tutors will appear here</p>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="bg-white border-[1.5px] border-green-100 rounded-3xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={28} className="text-green-300" />
            </div>
            <h3 className="text-lg font-bold text-green-900 mb-1">Coming Soon</h3>
            <p className="text-sm text-green-400">Track your learning progress over time</p>
          </div>
        )}

      </div>
    </div>
  );
}

function BookingCard({ booking }) {
  const statusColors = {
    Confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' },
    Pending:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-400' },
    Cancelled: { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-400' },
  };
  const s = statusColors[booking?.status] || statusColors.Pending;

  return (
    <div className="group bg-white border-[1.5px] border-green-100 rounded-3xl p-5 hover:border-lime-300 hover:shadow-lg hover:shadow-lime-100/50 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <img
          src={booking?.tutorImage || ""}
          alt={booking?.tutorName || "Tutor"}
          className="w-14 h-14 rounded-2xl object-cover border border-green-100 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-green-900 truncate">
              {booking?.tutorName || "Unknown Tutor"}
            </h3>
            <span className={`shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {booking?.status || "Pending"}
            </span>
          </div>
          <p className="text-sm text-green-600 font-medium mt-0.5">
            {booking?.subject || "No Subject"}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2.5 bg-green-50 rounded-2xl p-4 border border-green-100">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold text-green-500">
            <Calendar size={13} /> Date
          </span>
          <span className="text-xs font-bold text-green-800">
            {booking?.bookedAt
              ? new Date(booking.bookedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold text-green-500">
            <Clock size={13} /> Time
          </span>
          <span className="text-xs font-bold text-green-800">
            {booking?.bookedAt
              ? new Date(booking.bookedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold text-green-500">
            <MapPin size={13} /> Mode
          </span>
          <span className="text-xs font-bold text-green-800">
            {booking?.teachingMethod || "N/A"}
          </span>
        </div>
        <div className="pt-2 border-t border-green-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-green-500">Rate</span>
          <span className="text-sm font-extrabold text-green-900">
            ৳{booking?.hourlyFee || 0}<span className="text-green-500 font-medium text-xs">/hr</span>
          </span>
        </div>
      </div>
    </div>
  );
}