'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Parkinsans } from 'next/font/google';
import { ArrowRight, MapPin, Clock, Star, Search, CalendarDays, X } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { BookOpen, Wallet } from 'lucide-react'; // add to your existing lucide import

const COVER_PALETTES = [
  ['#d9f99d', '#4ade80', '#0f766e', '#facc15'],
  ['#fde68a', '#fb923c', '#e11d48', '#f9a8d4'],
  ['#a5f3fc', '#38bdf8', '#4f46e5', '#a7f3d0'],
  ['#fbcfe8', '#c084fc', '#6d28d9', '#fde68a'],
  ['#bbf7d0', '#22d3ee', '#1d4ed8', '#d9f99d'],
  ['#fed7aa', '#f472b6', '#7c3aed', '#fef08a'],
];

function coverStyle(seed) {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  h >>>= 0;
  const [a, b, c, d] = COVER_PALETTES[(h >>> 8) % COVER_PALETTES.length];
  const at = (s) => (h >>> s) % 100;
  return {
    backgroundImage: [
      `radial-gradient(circle at ${at(0)}% ${at(5)}%, ${d} 0%, transparent 45%)`,
      `radial-gradient(circle at ${at(10)}% ${at(15)}%, ${c} 0%, transparent 55%)`,
      `radial-gradient(circle at ${at(20)}% ${at(25)}%, ${b} 0%, transparent 60%)`,
      `linear-gradient(${(h >>> 3) % 360}deg, ${a}, ${b})`,
    ].join(','),
  };
}

function getDuration(start, end) {
  if (!start || !end) return { value: '—', unit: 'Duration' };
  const days = Math.round((new Date(end) - new Date(start)) / 86400000) + 1;
  if (!Number.isFinite(days) || days < 1) return { value: '—', unit: 'Duration' };
  if (days >= 60) return { value: Math.round(days / 30), unit: 'Months' };
  return { value: days, unit: days === 1 ? 'Day' : 'Days' };
}

function dateRange(start, end) {
  const f = (d, y) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(y && { year: 'numeric' }) });
  if (start && end) return `${f(start)} – ${f(end, true)}`;
  if (start) return `From ${f(start, true)}`;
  return `Until ${f(end, true)}`;
}
const parkinsans = Parkinsans({ subsets: ['latin'], display: 'swap' });

const AllTutorsPage = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const response = await fetch(`${API_URL}/api/tutors?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch tutor profiles.');
        
        const data = await response.json();
        
        // Filter out tutors whose status is not 'approved'
        const approvedTutors = data.filter(tutor => tutor.status === 'approved');
        setTutors(approvedTutors);
        
      } catch (err) {
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };
    const delay = setTimeout(fetchTutors, 300);
    return () => clearTimeout(delay);
  }, [search, startDate, endDate]);
  const hasFilters = search || startDate || endDate;
  return (
    <main className={`${parkinsans.className} min-h-screen bg-green-50 py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Banner */}
        <div className="rounded-3xl bg-green-950 text-white px-8 md:px-12 py-10 mb-10 overflow-hidden relative">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className={`${parkinsans.className} inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-lime-400/20 text-lime-300 border border-lime-400/30`}>
              Global Network
            </span>
            <h1 className={`${parkinsans.className} text-3xl md:text-4xl font-bold tracking-tight`}>
              Find Your Perfect Tutor
            </h1>
            <p className={`${parkinsans.className} text-green-300 text-sm md:text-base leading-relaxed`}>
              Connect with certified experts, university mentors, and industry veterans ready to guide you 1-on-1.
            </p>
          </div>
          <div className="absolute -top-10 right-0 w-72 h-72 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Filters */}
        <div className="bg-white border-[1.5px] border-green-200 rounded-3xl p-5 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className={`${parkinsans.className} text-[11px] font-bold text-green-700 uppercase tracking-widest`}>Search Name</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. Rahat Khan..."
                className={`${parkinsans.className} w-full pl-9 pr-4 py-2.5 text-sm bg-green-50 border border-green-200 rounded-2xl focus:outline-none focus:border-green-500 transition text-green-900 placeholder:text-green-400`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={`${parkinsans.className} text-[11px] font-bold text-green-700 uppercase tracking-widest`}>Available From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`${parkinsans.className} w-full px-4 py-2.5 text-sm bg-green-50 border border-green-200 rounded-2xl focus:outline-none focus:border-green-500 transition text-green-900`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={`${parkinsans.className} text-[11px] font-bold text-green-700 uppercase tracking-widest`}>Available Until</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`${parkinsans.className} w-full px-4 py-2.5 text-sm bg-green-50 border border-green-200 rounded-2xl focus:outline-none focus:border-green-500 transition text-green-900`}
            />
          </div>

          <button
            onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); }}
            className={`${parkinsans.className} flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-2xl font-bold text-sm transition-all ${
              hasFilters
                ? 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100'
                : 'bg-green-100 text-green-500 border border-green-200 cursor-not-allowed opacity-50'
            }`}
            disabled={!hasFilters}
          >
            <X size={14} />
            Reset Filters
          </button>
        </div>

        {/* Result count */}
        {!loading && !error && (
          <p className={`${parkinsans.className} text-sm text-green-600 font-semibold mb-6`}>
            Showing <span className="text-green-900">{tutors.length}</span> tutor{tutors.length !== 1 ? 's' : ''}
            {hasFilters && ' matching your filters'}
          </p>
        )}

        {/* Error */}
        {error && (
          <div className={`${parkinsans.className} p-4 rounded-2xl text-red-700 bg-red-50 border border-red-100 text-center max-w-md mx-auto mb-8 text-sm`}>
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1,2,3,4,5,6,7,8].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-5 border-[1.5px] border-green-100 animate-pulse space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-green-100 mx-auto" />
                <div className="h-4 bg-green-100 rounded-full w-2/3 mx-auto" />
                <div className="h-3 bg-green-100 rounded-full w-1/2 mx-auto" />
                <div className="h-10 bg-green-100 rounded-2xl w-full mt-2" />
              </div>
            ))}
          </div>

        ) : tutors.length === 0 ? (
          <div className="text-center py-24 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-green-400" />
            </div>
            <h3 className={`${parkinsans.className} text-xl font-bold text-green-900 mb-2`}>No tutors found</h3>
            <p className={`${parkinsans.className} text-sm text-green-600`}>
              Try adjusting your filters or check back soon as new tutors join.
            </p>
          </div>

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            {tutors.map((tutor) => {
              const duration = getDuration(tutor.sessionStartDate, tutor.sessionEndDate);
              const isAvailable = tutor.sessionStartDate
                ? new Date(tutor.sessionStartDate) <= new Date()
                : true;

              return (
                <div
  key={tutor._id}
  className={`${parkinsans.className} group flex flex-col rounded-[2rem] bg-white p-2.5 shadow-[0_10px_30px_-12px_rgba(20,83,45,0.25)] ring-1 ring-green-900/5 transition-transform duration-300 hover:-translate-y-1`}
>
  {/* Cover + avatar + subject pill */}
  <div className="relative">
    <div className="h-32 rounded-3xl" style={coverStyle(tutor._id ?? tutor.tutorName)} />

    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-green-900 backdrop-blur">
      <span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-slate-400'}`} />
      {isAvailable ? 'Available' : 'Unavailable'}
    </span>

    <div className="absolute bottom-0 left-4 translate-y-1/2">
      {tutor.tutorImage ? (
        <img
          src={tutor.tutorImage}
          alt={tutor.tutorName}
          className="h-[68px] w-[68px] rounded-full bg-lime-100 object-cover ring-[5px] ring-white"
        />
      ) : (
        <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-lime-100 text-2xl font-bold text-green-800 ring-[5px] ring-white">
          {tutor.tutorName?.charAt(0).toUpperCase()}
        </div>
      )}
    </div>

    <span className="absolute bottom-0 right-3 inline-flex max-w-[58%] translate-y-1/2 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-bold text-green-950 shadow-[0_4px_14px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
      <BookOpen size={16} className="shrink-0 text-lime-600" />
      <span className="truncate">{tutor.subject || 'Academic Mentor'}</span>
    </span>
  </div>

  {/* Name + location */}
  <div className="px-3 pt-11">
    <h3 className="truncate text-lg font-bold leading-tight text-green-950">{tutor.tutorName}</h3>
    {tutor.location && (
      <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-400">
        <MapPin size={13} className="shrink-0" />
        <span className="truncate">{tutor.location}</span>
      </p>
    )}
  </div>

  {/* Stats */}
  <div className="mt-5 grid grid-cols-3 gap-2 px-3">
    <div className="flex min-w-0 items-start gap-2">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white">
        <Star size={11} className="fill-white" />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-bold text-green-950">
          {tutor.rating ? Number(tutor.rating).toFixed(1) : '—'}
        </p>
        <p className="mt-1 text-xs text-slate-400">Rating</p>
      </div>
    </div>

    <div className="flex min-w-0 items-start gap-2">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
        <Wallet size={11} />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-bold text-green-950">
          {tutor.hourlyRate ? `$${tutor.hourlyRate}` : '—'}
        </p>
        <p className="mt-1 text-xs text-slate-400">per hour</p>
      </div>
    </div>

    <div className="flex min-w-0 items-start gap-2">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white">
        <Clock size={11} />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-bold text-green-950">{duration.value}</p>
        <p className="mt-1 text-xs text-slate-400">{duration.unit}</p>
      </div>
    </div>
  </div>

  {/* Session dates */}
  {(tutor.sessionStartDate || tutor.sessionEndDate) && (
    <p className="mx-3 mt-4 flex items-center gap-1.5 text-xs text-slate-400">
      <CalendarDays size={13} className="shrink-0" />
      {dateRange(tutor.sessionStartDate, tutor.sessionEndDate)}
    </p>
  )}

  {/* CTA */}
  <div className="mt-auto pt-5">
    <Link
      href={`/tutors/${tutor._id}`}
      className="block w-full rounded-2xl border border-green-100 bg-gradient-to-b from-white to-green-50 py-3.5 text-center text-sm font-bold text-green-950 transition-colors hover:border-lime-300 hover:from-lime-50 hover:to-lime-100"
    >
      Book a Session
    </Link>
  </div>
</div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default AllTutorsPage;