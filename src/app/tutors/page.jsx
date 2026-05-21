'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiCalendar, FiClock, FiUser, FiBookOpen } from 'react-icons/fi';



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


        const response = await fetch(`http://localhost:4500/api/tutors?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tutor profiles from the server.');
        }
        const data = await response.json();
        setTutors(data);
      } catch (err) {
        setError(err.message || 'Something went wrong while retrieving data.');
      } finally {
        setLoading(false);
      }
    };


    const delayDebounceFn = setTimeout(() => {
            fetchTutors();
        }, 300); // Waits 300ms after you stop typing to execute

        return () => clearTimeout(delayDebounceFn);

  }, [search, startDate, endDate]);


  const handleClearFilters = () => {
        setSearch('');
        setStartDate('');
        setEndDate('');
    };


  

  return (
    <main className="min-h-screen bg-white py-12">
            

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Banner / Header */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white p-8 md:p-12 shadow-xl mb-12">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 backdrop-blur-md">
              <FiBookOpen className="text-sky-400" /> Global Network
            </span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Explore Our All Available Tutors
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Connect with certified experts, university mentors, and professional field industry veterans ready to guide you 1-on-1.
            </p>
          </div>

          {/* Geometric decorative background overlay elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
          <div className="absolute -bottom-10 right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl -z-0 pointer-events-none" />
        </div>

        {/* Global Network Error Layer */}
        {error && (
          <div className="p-4 rounded-xl text-red-700 bg-red-50 border border-red-100 text-center max-w-md mx-auto mb-12">
            {error}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-5  mb-10 grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
                
                <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700 uppercase tracking-wider">Search Name</label>
                    <input 
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="e.g. Rahat Khan..."
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950 transition text-slate-900"
                    />
                </div>

                
                <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700 uppercase tracking-wider">Available From</label>
                    <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950 transition text-slate-900"
                    />
                </div>

            
                <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700 uppercase tracking-wider">Available Until</label>
                    <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950 transition text-slate-900"
                    />
                </div>

                <div>
                    <button
                        onClick={handleClearFilters}
                        className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-center"
                    >
                        Reset All Filters
                    </button>
                </div>
            </div>

        {/* Loading Cards Grid View State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4 animate-pulse">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-slate-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-slate-200 rounded w-full pt-4" />
                <div className="h-10 bg-slate-200 rounded-xl w-full mt-4" />
              </div>
            ))}
          </div>
        ) : tutors.length === 0 ? (
          /* Empty List UI Fallback block */
          <div className="text-center py-20 bg-white rounded-3xl border border-sky-100/50 p-8 max-w-md mx-auto shadow-sm">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <FiUser className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No Active Profiles</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">
              Our roster is currently empty. Check back shortly as expert applications clear validation queues!
            </p>
          </div>
        ) : (
          /* Main Cards Display Grid Layer matching requirements */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor) => (
              <div
                key={tutor._id}
                className="group bg-white rounded-2xl p-6 border border-sky-100/60 shadow-md hover:shadow-xl hover:border-sky-200/80 transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1"
              >
                <div>
                  {/* Card Profile Top Block Row */}
                  <div className="flex items-center gap-4 mb-4">
                    {tutor.tutorImage ? (
                      <img
                        src={tutor.tutorImage}
                        alt={tutor.tutorName}
                        className="w-14 h-14 rounded-full object-cover border-2 border-sky-100 group-hover:border-sky-300 transition-colors"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center text-xl font-bold border border-sky-100">
                        {tutor.tutorName?.charAt(0).toUpperCase() || "No name provided"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-sky-600 transition-colors">
                        {tutor.tutorName}
                      </h3>
                      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 mt-0.5">
                        {tutor.subject || 'Academic Mentor'}
                      </span>
                    </div>
                  </div>

                  {/* Body description text info block */}
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {tutor.bio || 'Expert 1-on-1 personalized tutoring sessions designed to build confidence and help students master concepts.'}
                  </p>

                  {/* Scheduled Availability Parameters line footer mapping details */}
                  {tutor.sessionStartDate && (
                    <div className="space-y-2 pt-3 border-t border-slate-50 mb-6">
                      <div className="flex items-center text-xs text-slate-500 gap-2">
                        <FiCalendar className="text-sky-500 shrink-0" />
                        <span>
                          Starts:{' '}
                          <span className="font-medium text-slate-700">
                            {new Date(tutor.sessionStartDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </span>
                      </div>
                      {tutor.sessionEndDate && (
                        <div className="flex items-center text-xs text-slate-500 gap-2">
                          <FiClock className="text-sky-400 shrink-0" />
                          <span>
                            Until:{' '}
                            <span className="font-medium text-slate-700">
                              {new Date(tutor.sessionEndDate).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>


                <Link
                  href={`/tutors/${tutor._id}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-sky-600 bg-sky-50/50 hover:bg-sky-500 hover:text-white rounded-xl transition-all duration-200 group-hover:shadow-md group-hover:shadow-sky-100"
                >
                  <span>Book a Session</span>
                  <FiArrowRight className="h-4 w-4" />
                </Link>

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default AllTutorsPage;