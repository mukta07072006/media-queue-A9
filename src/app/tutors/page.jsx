'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Parkinsans } from 'next/font/google';
import { ArrowRight, MapPin, Clock, Star, Search, CalendarDays, X } from 'lucide-react';
import { API_URL } from '@/lib/api';

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
  console.log(tutors)
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {tutors.map((tutor) => {
              const isAvailable = tutor.sessionStartDate
                ? new Date(tutor.sessionStartDate) <= new Date()
                : true;

              return (
                <div
                  key={tutor._id}
                  className="group bg-white rounded-3xl border-[1.5px] border-green-100 hover:border-lime-400 transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden"
                >
                  {/* Card top */}
                  <div className="p-5 flex flex-col items-center text-center border-b border-green-50">
                    {/* Avatar */}
                    <div className="relative mb-3">
                      {tutor.tutorImage ? (
                        <img
                          src={tutor.tutorImage}
                          alt={tutor.tutorName}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-green-100 group-hover:border-lime-300 transition-colors"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-lime-100 text-green-800 flex items-center justify-center text-2xl font-bold border-2 border-green-100">
                          {tutor.tutorName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {/* Availability dot */}
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isAvailable ? 'bg-lime-400' : 'bg-slate-300'}`} />
                    </div>

                    {/* Availability badge */}
                    <span className={`${parkinsans.className} inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-2 ${
                      isAvailable
                        ? 'bg-lime-100 text-green-700 border border-lime-300'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-slate-400'}`} />
                      {isAvailable ? 'Available' : 'Unavailable'}
                    </span>

                    <h3 className={`${parkinsans.className} font-bold text-green-900 text-base leading-tight`}>
                      {tutor.tutorName}
                    </h3>
                    <p className={`${parkinsans.className} text-xs text-green-500 mt-0.5 font-semibold`}>
                      {tutor.subject || 'Academic Mentor'}
                    </p>
                  </div>

                  {/* Card meta */}
                  <div className="px-5 py-4 space-y-2.5 flex-1">
                    {tutor.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-green-400 shrink-0" />
                        <span className={`${parkinsans.className} text-xs text-green-700`}>{tutor.location}</span>
                      </div>
                    )}
                    {tutor.sessionStartDate && (
                      <div className="flex items-center gap-2">
                        <CalendarDays size={13} className="text-green-400 shrink-0" />
                        <span className={`${parkinsans.className} text-xs text-green-700`}>
                          From{' '}
                          <span className="font-semibold text-green-900">
                            {new Date(tutor.sessionStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </span>
                      </div>
                    )}
                    {tutor.sessionEndDate && (
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-green-400 shrink-0" />
                        <span className={`${parkinsans.className} text-xs text-green-700`}>
                          Until{' '}
                          <span className="font-semibold text-green-900">
                            {new Date(tutor.sessionEndDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </span>
                      </div>
                    )}
                    {tutor.hourlyRate && (
                      <div className="flex items-center justify-between pt-1">
                        <span className={`${parkinsans.className} text-xs text-green-600`}>Rate</span>
                        <span className={`${parkinsans.className} text-sm font-bold text-green-900`}>
                          ${tutor.hourlyRate}<span className="text-xs font-normal text-green-500">/hr</span>
                        </span>
                      </div>
                    )}
                    {tutor.rating && (
                      <div className="flex items-center gap-1 pt-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star
                            key={s}
                            size={11}
                            className={s <= Math.round(tutor.rating) ? 'text-lime-500 fill-lime-400' : 'text-green-200 fill-green-100'}
                          />
                        ))}
                        <span className={`${parkinsans.className} text-xs text-green-600 ml-1`}>{tutor.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="px-5 pb-5">
                    <Link
                      href={`/tutors/${tutor._id}`}
                      className={`${parkinsans.className} w-full inline-flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-bold text-green-900 bg-lime-300 hover:bg-lime-400 rounded-2xl transition-all duration-200`}
                    >
                      Book a Session
                      <div className="w-6 h-6 rounded-full bg-green-900 flex items-center justify-center">
                        <ArrowRight size={13} className="text-lime-300" />
                      </div>
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