'use client';

import React, { useState, useEffect, use } from 'react';
import { FiCalendar, FiClock, FiLayers, FiMapPin, FiPhone, FiUser, FiX, FiDollarSign, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';



const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';

export default function TutorDetailsPage({ params }) {
  const { id: tutorId } = use(params);


  const { data: session, isPending, error } = authClient.useSession();

  const { user } = session || {};
  // console.log(user?.id)

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
    // console.log("clicked");
    // console.log(tutor)
    if (tutor.totalSlot <= 0) {
      toast.error('No available slots left for this tutor.');
      return;
    }

    const today = new Date();

    const sessionDate = new Date(tutor.sessionEndDate);

    if (today > sessionDate) {
      toast.error('Booking is not available yet for this tutor.');
      console.log("error: Booking not available yet")
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (e) => {
    
    e.preventDefault();

      const {data: tokenData} =await authClient.token();
  console.log("Token data:", tokenData);

    setBookingLoading(true);

    

    try {
      
      const payload = {
        tutorId: tutor._id,
        tutorName: tutor.tutorName,
        tutorImage: tutor.tutorImage,
        hourlyFee: tutor.hourlyFee,
        location: tutor.location,
        teachingMethod: tutor.teachingMethod,
        availableTime: tutor.availableTime,
        subject: tutor.subject,
        studentId: user?.id,
        studentName,
        status: 'Confirmed',
        studentPhone,
        userId: user.id,
        bookedAt: new Date().toISOString(),
      };

      const res = await fetch(`${API}/api/bookings?tutorId=${tutor._id}&userId=${user?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenData.token}`,
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
    { icon: <FiBook className="text-violet-500" />, label: 'Teaching Mode', value: tutor.teachingMethod || 'N/A' },
    { icon: <FiMapPin className="text-rose-400" />, label: 'Location', value: tutor.location || 'N/A' },
    { icon: <FiLayers className="text-amber-500" />, label: 'Available Slots', value: `${tutor.totalSlot ?? 0} slots` },
  ];

  return (
    <main className="min-h-screen bg-[#f7fbff] px-6 lg:px-14 py-12 overflow-hidden relative">

  {/* background blobs */}
  <div className="absolute top-0 left-0 w-72 h-72 bg-sky-200/30 blur-3xl rounded-full" />
  <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-100/40 blur-3xl rounded-full" />

  <div className="max-w-6xl mx-auto relative z-10">

    <div className="grid lg:grid-cols-[320px_1fr] gap-10 items-start">

      {/* LEFT PROFILE */}
      <div className="space-y-6">

        {/* avatar */}
        <div className="relative w-fit">

          {tutor.tutorImage ? (
            <img
              src={tutor.tutorImage}
              alt={tutor.tutorName}
              className="w-36 h-36 rounded-[36px] object-cover shadow-2xl shadow-sky-100"
            />
          ) : (
            <div className="w-36 h-36 rounded-[36px] bg-sky-100 flex items-center justify-center text-5xl font-black text-sky-500">
              {tutor.tutorName?.charAt(0).toUpperCase()}
            </div>
          )}

          {/* floating action */}
          
        </div>

        {/* name */}
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">
            {tutor.tutorName}
          </h1>

          <p className="text-sky-500 font-semibold mt-1">
            {tutor.subject || 'Academic Mentor'}
          </p>
        </div>

        {/* lightweight menu style info */}
        <div className="space-y-3 text-slate-400 font-medium flex flex-col">

          {/* <div className="hover:text-slate-700 transition cursor-pointer badge badge-outline">
            {tutor.institution}
          </div> */}

          <div className="hover:text-slate-700 transition cursor-pointer badge border-none bg-blue-100 text-blue-800">
            {tutor.experience} Experience
          </div>

          <div className="hover:text-slate-700 transition cursor-pointer badge border-none bg-green-100 text-green-800">
            {tutor.totalSlot ?? 0} Slots Left
          </div>
          <button
            onClick={handleOpenModal}
            className="btn bg-blue-500 text-white border-none hover:bg-blue-600 w-full mb-4 shadow-none transition-all hover:-translate-y-0.5"
          >
            Book a session
          </button>

        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="space-y-8">

        {/* expertise */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_10px_40px_rgba(96,165,250,0.08)]">

          <h3 className="text-lg font-bold text-slate-700 mb-6">
            Specializes in...
          </h3>

          <div className="flex flex-wrap gap-4">

            {infoItems.map((item) => (
              <div
                key={item.label}
                className="px-5 py-3 rounded-2xl bg-[#f5f9ff] border border-sky-100 text-slate-600 font-medium hover:-translate-y-1 transition-all shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sky-400">
                    {item.icon}
                  </span>

                  <span>
                    {item.value}
                  </span>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* bio */}
        {tutor.bio && (
          <div className="bg-white/60 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_10px_40px_rgba(96,165,250,0.06)]">

            <h3 className="text-lg font-bold text-slate-700 mb-4">
              About
            </h3>

            <p className="text-slate-500 leading-relaxed text-[15px] max-w-3xl">
              {tutor.bio}
            </p>
          </div>
        )}

      </div>
    </div>
  </div>

  {/* MODAL */}
  {isModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">

      {/* backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={() => setIsModalOpen(false)}
      />

      {/* modal */}
      <div className="relative z-10 w-full max-w-md rounded-[36px] bg-white p-8 shadow-2xl border border-sky-100">

        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-5 right-5 w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
        >
          <FiX className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <h2 className="text-3xl font-black text-slate-800">
            Book Session
          </h2>

          <p className="text-slate-400 mt-1 text-sm">
            Reserve your tutoring slot
          </p>
        </div>

        {/* tutor mini strip */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#f5f9ff] border border-sky-100 mb-6">

          {tutor.tutorImage ? (
            <img
              src={tutor.tutorImage}
              alt=""
              className="w-14 h-14 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center font-bold text-sky-500">
              {tutor.tutorName?.charAt(0)}
            </div>
          )}

          <div>
            <h4 className="font-bold text-slate-700">
              {tutor.tutorName}
            </h4>

            <p className="text-sm text-slate-400">
              {tutor.subject}
            </p>
          </div>
        </div>

        <form onSubmit={handleConfirmBooking} className="space-y-4">

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">
              Full Name
            </label>

            <div className="relative">

              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />

              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Your name"
                className="w-full h-12 pl-11 pr-4 rounded-2xl text-slate-600 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-300 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">
              Phone Number
            </label>

            <div className="relative">

              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />

              <input
                type="tel"
                required
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full h-12 pl-11 pr-4 rounded-2xl text-slate-600 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-300 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={bookingLoading}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-bold shadow-xl shadow-sky-200 transition-all hover:-translate-y-0.5"
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