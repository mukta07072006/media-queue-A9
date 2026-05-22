'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { API_URL } from '@/lib/api';

const AvailableTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await fetch(`${API_URL}/api/tutors/home`);
        if (!response.ok) {
          throw new Error('Failed to fetch tutor data from the server.');
        }
        const data = await response.json();
        setTutors(data);
      } catch (err) {
        setError(err.message || 'Something went wrong while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  return (
    <section className="pb-16 bg-slate-50/50 min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight sm:text-4xl">
            Available Expert Tutors
          </h2>
          <p className="mt-3 text-lg text-slate-500">
            Browse through active professional mentors currently scheduling interactive booking sessions.
          </p>
        </div>

       
        {error && (
          <div className="p-4 rounded-xl text-red-700 bg-red-50 border border-red-100 text-center max-w-md mx-auto mb-8">
            {error}
          </div>
        )}

        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
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
          /* Empty Database Fallback State */
          <div className="text-center py-16 bg-white rounded-2xl border border-sky-100/50 p-8 max-w-full mx-auto shadow-md">
            <FiUser className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No Tutors Available</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
              There are currently no active tutor profiles registered on the server.
            </p>
          </div>
        ) : (
          /* Main Cards Display Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor) => (
              <div
                key={tutor._id}
                className="group bg-white rounded-2xl p-6 border border-sky-100/60 shadow-md hover:shadow-xl hover:border-sky-200/80 transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1"
              >
                <div>
                  {/* Card Profile Top Row */}
                  <div className="flex items-center gap-4 mb-4">
                    {tutor.tutorImage ? (
                      <img
                        src={tutor.tutorImage}
                        alt={tutor.tutorName}
                        className="w-14 h-14 rounded-full object-cover border-2 border-sky-100 group-hover:border-sky-300 transition-colors"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center text-xl font-bold border border-sky-100">
                        {tutor.tutorName?.charAt(0).toUpperCase()}
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

                  {/* Tutor Bio Snippet */}
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {tutor.bio || 'Expert 1-on-1 personalized tutoring sessions designed to build confidence and help students master concepts.'}
                  </p>

                  {/* Scheduled Availability Subtext */}
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

                {/* Direct Action Link */}
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
    </section>
  );
};

export default AvailableTutors;