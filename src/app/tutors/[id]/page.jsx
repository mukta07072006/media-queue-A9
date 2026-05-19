'use client';

import React, { useState, useEffect, use } from 'react';
import { FiCalendar, FiClock, FiLayers, FiMapPin, FiPhone, FiUser, FiX, FiDollarSign, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';

export default function TutorDetailsPage({ params }) {
  const { id: tutorId } = use(params);


        const { data: session, isPending, error } = authClient.useSession();

        const {user} = session || {};
        console.log(user.id)

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const res = await fetch(`${API}/api/tutors/${tutorId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Tutor not found.');
        setTutor(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTutor();
  }, [tutorId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!tutor) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-500 font-medium">Tutor profile unavailable.</p>
    </div>
  );


  const handleOpenModal = () => {
    console.log("clicked");
    console.log(tutor.totalSlots)
    if (tutor.totalSlots === 0) {
      toast.error('No available slots left for this tutor.');
      return;
    }
    
    const today = new Date();
    console.log(today)
    const sessionDate = new Date(tutor.sessionEndDate);
    console.log(sessionDate)
    if (today > sessionDate) {
      toast.error('Booking is not available yet for this tutor.');
      console.log("error: Booking not available yet")
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setBookingLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        tutorId: tutor._id,
        tutorName: tutor.tutorName,
        subject: tutor.subject,
        studentName,
        studentPhone,
        userId: user.id,
        bookedAt: new Date().toISOString(),
      };

      const res = await fetch(`${API}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Booking failed.');

     
      setTutor(prev => ({ ...prev, totalSlots: prev.totalSlots - 1 }));
      toast.success('Session booked successfully!');
      setIsModalOpen(false);
      setStudentName('');
      setStudentPhone('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const infoItems = [
    { icon: <FiCalendar className="text-sky-500" />, label: 'Session Starts', value: tutor.sessionStartDate ? new Date(tutor.sessionStartDate).toLocaleDateString() : 'N/A' },
    { icon: <FiClock className="text-sky-400" />, label: 'Available Time', value: tutor.availableTime || 'N/A' },
    { icon: <FiDollarSign className="text-emerald-500" />, label: 'Hourly Fee', value: tutor.hourlyFee ? `$${tutor.hourlyFee}` : 'N/A' },
    { icon: <FiBook className="text-violet-500" />, label: 'Teaching Mode', value: tutor.teachingMode || 'N/A' },
    { icon: <FiMapPin className="text-rose-400" />, label: 'Location', value: tutor.location || 'N/A' },
    { icon: <FiLayers className="text-amber-500" />, label: 'Available Slots', value: `${tutor.totalSlots ?? 0} slots` },
  ];

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

          {/* Banner */}
          <div className="h-44 bg-gradient-to-r from-sky-400 to-blue-600" />

          <div className="px-6 sm:px-10 pb-10 relative">

            {/* Avatar */}
            <div className="absolute -top-16 left-6 sm:left-10">
              {tutor.tutorImage ? (
                <img
                  src={tutor.tutorImage}
                  alt={tutor.tutorName}
                  className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-sky-100 border-4 border-white shadow-lg flex items-center justify-center text-4xl font-black text-sky-500">
                  {tutor.tutorName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name + Button */}
            <div className="pt-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-800">{tutor.tutorName}</h1>
                <p className="text-sky-600 font-semibold mt-0.5">{tutor.subject || 'Academic Mentor'}</p>
                <p className="text-slate-400 text-sm mt-0.5">{tutor.institution} · {tutor.experience} exp.</p>
              </div>
              <button
                onClick={handleOpenModal}
                className="px-7 py-3 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-200 transition-all duration-200 active:scale-95 whitespace-nowrap"
              >
                Book 1-on-1 Session
              </button>
            </div>

            <hr className="my-7 border-slate-100" />

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {infoItems.map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1.5">{item.icon}<span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{item.label}</span></div>
                  <p className="text-sm font-bold text-slate-700">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Bio */}
            {tutor.bio && (
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-2">About</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{tutor.bio}</p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative z-10 bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-100">

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-black text-slate-800 mb-5">Confirm Booking</h3>

            {/* Auto-filled info */}
            <div className="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Tutor</span>
                <span className="font-bold text-slate-700">{tutor.tutorName}</span>
              </div>
              <div className="flex justify-between">
                <span>Subject</span>
                <span className="font-bold text-slate-700">{tutor.subject || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Slots Left</span>
                <span className="font-bold text-emerald-600">{tutor.totalSlots ?? 0}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4">

              {/* Student Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Your Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Rahim Uddin"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-gray-500 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Phone Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-gray-500 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white text-sm font-bold rounded-xl transition-colors"
              >
                {bookingLoading ? 'Processing...' : 'Confirm Booking'}
              </button>

            </form>
          </div>
        </div>
      )}
    </main>
  );
}