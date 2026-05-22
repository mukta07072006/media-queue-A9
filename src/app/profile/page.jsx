'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, BookOpen, Share2, MapPin, Users,
  Video, MapPinCheck, Clock, Calendar, Phone, Sparkles,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState('sessions');
  const [userProfile, setUserProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const session = authClient.useSession();
  const userd = session.data?.user;

  useEffect(() => {
    if (!userd?.email) return;
    fetch(`http://localhost:4500/api/auth/user/${userd.email}`)
      .then(r => r.json())
      .then(d => setUserProfile(d?.[0]));
  }, [session]);

  useEffect(() => {
    if (!userd?.id) return;
    fetch(`http://localhost:4500/api/bookings/mine?studentId=${userd.id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => setBookings(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userd?.id]);

  if (!session.data) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f7fd]">
      <p className="text-slate-400">Please log in to view your profile.</p>
    </div>
  );

  const stats = [
    { icon: <BookOpen size={16} />, label: 'Tutors Added',   value: 40,    bg: 'bg-blue-50',   icon_bg: 'bg-white', color: 'text-blue-400' },
    { icon: <Share2   size={16} />, label: 'Total Sessions', value: 187,   bg: 'bg-emerald-50', icon_bg: 'bg-white', color: 'text-emerald-400' },
    { icon: <Users    size={16} />, label: 'Completed',      value: '29k', bg: 'bg-orange-50',  icon_bg: 'bg-white', color: 'text-orange-400' },
  ];

  return (
    <div className="min-h-screen bg-[#f2f7fd]">

      {/* NAV */}
      <header className=" top-0 z-50 h-[60px] flex items-center mt-3">
        <div className="max-w-5xl mx-auto w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            
            <span className="font-bold text-3xl text-slate-800">Profile</span>
          </div>
          <button className="px-5 py-2 rounded-full bg-black hover:bg-gray-500 text-white font-bold text-[13px] shadow-[0_3px_12px_rgba(96,165,250,0.35)] transition-colors cursor-pointer">
            Follow
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-7 pb-16">


        <div className="relative bg-white rounded-3xl p-8 border border-blue-100 shadow-[0_4px_24px_rgba(96,165,250,0.08)] overflow-hidden mb-6">

          {/* deco blobs */}
          <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-blue-50 opacity-60 pointer-events-none animate-[floatA_7s_ease-in-out_infinite]" />
          <div className="absolute -bottom-10 right-40 w-36 h-36 rounded-full bg-emerald-50 opacity-60 pointer-events-none animate-[floatB_9s_ease-in-out_1.5s_infinite]" />

          <div className="relative z-10 flex flex-wrap items-center gap-7">

            
            <div className="relative shrink-0">
              <img
                src={userProfile?.photoUrl || "https://i.ibb.co/4pDNDk1/avatar.png"}
                alt="avatar"
                className="w-28 h-28 rounded-full object-cover border-[3px] border-gray-100 shadow-[0_4px_20px_rgba(96,165,250,0.14)]"
              />
              <span className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
            </div>

            {/* Name / meta */}
            <div className="flex-1 min-w-[180px]">
              <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1 text-[10px] font-bold text-blue-400 tracking-widest uppercase mb-2">
                <Sparkles size={10} /> Student
              </div>
              <h2 className="text-[32px] font-extrabold text-slate-800 leading-none tracking-tight mb-2">
                {userProfile?.name ?? userd?.name ?? 'Your Name'}
              </h2>
              <div className="flex flex-wrap gap-4 text-[12px] text-slate-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-blue-400" />
                  {userProfile?.address ?? 'Location not set'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={12} className="text-blue-400" />
                  {userProfile?.phone ?? 'N/A'}
                </span>
              </div>
              <p className="mt-2.5 text-slate-400 text-[12.5px] leading-relaxed max-w-md">
                {userProfile?.bio ?? 'Welcome to your personal learning dashboard. Track your tutoring sessions and progress here.'}
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-2 shrink-0">
              {stats.map(s => (
                <div key={s.label} className={`flex items-center gap-3 ${s.bg} rounded-2xl px-4 py-2.5 min-w-[150px]`}>
                  <div className={`w-8 h-8 rounded-xl ${s.icon_bg} ${s.color} flex items-center justify-center shadow-sm shrink-0`}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-slate-800 leading-none">{s.value}</p>
                    <p className="text-[10.5px] text-slate-400 font-semibold mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-2 mb-5">
          {['sessions', 'my tutors'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-[12.5px] font-bold capitalize cursor-pointer transition-all ${
                activeTab === tab
                  ? 'bg-blue-400 text-white shadow-[0_3px_10px_rgba(96,165,250,0.3)]'
                  : 'bg-white text-slate-400 hover:text-slate-600 shadow-sm'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── SESSIONS ── */}
        {activeTab === 'sessions' && (
          loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-60 rounded-2xl bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 animate-pulse" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
              <BookOpen size={44} className="mb-3 opacity-40" />
              <p className="font-bold text-base text-slate-400">No sessions yet</p>
              <p className="text-xs mt-1">Book a tutor to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {bookings.map(b => <BookingCard key={b.studentId} booking={b} />)}
            </div>
          )
        )}

        {activeTab === 'my tutors' && (
          <p className="text-slate-400 text-sm font-semibold">Not implemented yet.</p>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking }) {
  const confirmed = booking.status === 'Confirmed';

  return (
    <div
                    key={booking._id}
                    className="group bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                    {/* Top Content */}
                    <div>
                        {/* Tutor Info */}
                        <div className="flex items-start gap-4">
                            <img
                                src={
                                    booking?.tutorImage ||
                                    "https://i.ibb.co/4pDNDk1/avatar.png"
                                }
                                alt={booking?.tutorName || "Tutor"}
                                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <h3 className="text-base font-bold text-slate-900 truncate">
                                            {booking?.tutorName || "Unknown Tutor"}
                                        </h3>

                                        <p className="text-sm text-slate-600 truncate mt-1">
                                            {booking?.subject || "No Subject"}
                                        </p>
                                    </div>

                                    <span
                                        className={`shrink-0 text-[11px] font-semibold px-3 py-1 rounded-full border ${
                                            booking?.status === "Confirmed"
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                : booking?.status === "Pending"
                                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                                : "bg-red-50 text-red-700 border-red-100"
                                        }`}
                                    >
                                        {booking?.status || "Pending"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>

                                    <span className="truncate">
                                        {booking?.location || "Location unavailable"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="mt-5 space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-slate-500">
                                    Teaching Setup
                                </span>

                                <span className="text-sm font-semibold text-slate-800 text-right">
                                    {booking?.teachingMethod || "N/A"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-slate-500">
                                    Reserved Slots
                                </span>

                                <span className="text-sm font-semibold text-slate-800">
                                    1 Slot
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-slate-500">
                                    Hourly Rate
                                </span>

                                <span className="text-sm font-bold text-slate-900">
                                    {booking?.hourlyFee || 0} BDT/hr
                                </span>
                            </div>

                            <div className="flex items-start justify-between gap-3">
                                <span className="text-sm text-slate-500 shrink-0">
                                    Transaction Date
                                </span>

                                <span className="text-xs text-slate-600 text-right break-words">
                                    {booking?.bookedAt
                                        ? new Date(
                                              booking.bookedAt
                                          ).toLocaleString()
                                        : "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
  );
}