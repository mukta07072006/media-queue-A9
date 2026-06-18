'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import { Parkinsans } from 'next/font/google';
import { 
  FiMapPin, 
  FiCompass, 
  FiShare, 
  FiHeart, 
  FiMoreHorizontal,
  FiChevronRight,
  FiChevronLeft,
  FiCheckCircle,
  FiBook,
  FiClock,
  FiMessageSquare
} from 'react-icons/fi';
import { FaLanguage } from "react-icons/fa6";
import { BsLightningChargeFill, BsStars } from 'react-icons/bs';
import toast from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import { API_URL } from '@/lib/api';

const API = API_URL;
const parkinsans = Parkinsans({ subsets: ['latin'], display: 'swap' });

// Helper: Get next 14 available dates based on tutor's slot schedule
const generateAvailableDates = (slotsMap) => {
  if (!slotsMap) return [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const availableDays = Object.keys(slotsMap);
  
  let dates = [];
  let currentDate = new Date();
  
  for (let i = 0; i < 30; i++) { 
    const dayName = dayNames[currentDate.getDay()];
    if (availableDays.includes(dayName)) {
      dates.push({
        dateObj: new Date(currentDate),
        dayName: dayName,
        dayStr: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr: currentDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        fullDate: currentDate.toISOString()
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates.slice(0, 10); 
};

export default function TutorDetailsPage({ params }) {
  const { id: tutorId } = use(params);

  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const { user } = session || {};

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Tab State
  const [activeTab, setActiveTab] = useState('overview');

  // Booking Selection State
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Carousel Ref for Date Swiping
  const dateCarouselRef = useRef(null);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const res = await fetch(`${API}/api/tutors/${tutorId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Tutor not found.');
        
        setTutor(data);
        
        const dates = generateAvailableDates(data.slots);
        setAvailableDates(dates);
        if (dates.length > 0) setSelectedDate(dates[0]);

      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTutor();
  }, [tutorId]);

  if (loading || sessionLoading) return (
    <div className={`${parkinsans.className} min-h-screen bg-green-50 flex items-center justify-center`}>
      <div className="w-10 h-10 border-4 border-green-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!tutor) return (
    <div className={`${parkinsans.className} min-h-screen bg-green-50 flex items-center justify-center text-green-700 font-bold`}>
      Profile unavailable.
    </div>
  );

  const handleBookSession = async () => {
    if (!user) return toast.error('Please log in to book a session.');
    if (!selectedDate || !selectedTime) return toast.error('Please select a date and time.');

    setBookingLoading(true);

    try {
      const { data: tokenData } = await authClient.token();
      
      const payload = {
        tutorId: tutor._id,
        tutorName: tutor.tutorName,
        tutorImage: tutor.tutorImage,
        hourlyFee: tutor.hourlyRate,
        location: tutor.location,
        teachingMethod: tutor.teachingMode,
        subject: tutor.subjects?.[0] || 'General',
        studentId: user?.id,
        studentName: user?.name || '',
        status: 'Confirmed',
        bookedDate: selectedDate.fullDate,
        bookedTime: selectedTime,
        userId: user?.id,
      };

      const res = await fetch(`${API}/api/bookings?tutorId=${tutor._id}&userId=${user?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenData?.token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Booking failed.');

      toast.success('Session booked successfully!');
      setSelectedTime(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  // Carousel Scroll Handlers
  const scrollDates = (direction) => {
    if (dateCarouselRef.current) {
      const scrollAmount = direction === 'left' ? -150 : 150;
      dateCarouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const timesForSelectedDate = selectedDate ? tutor.slots?.[selectedDate.dayName] || [] : [];

  return (
    <main className={`${parkinsans.className} min-h-screen bg-green-50/30 pb-20`}>
      
      {/* 1. Header Banner */}
      <div className="w-full h-[100px] bg-green-900 relative overflow-hidden">
        <div className=" w-96 h-96 bg-lime-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="max-w-[1100px] mx-auto px-6 sm:px-8">
        
        {/* 2. Top Profile Section */}
        <div className="relative flex flex-col md:flex-row justify-between items-start mb-10">
          
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-[60px] md:-mt-[70px]">
            <div className="w-[140px] h-[140px] rounded-full border-4 border-white bg-lime-100 shadow-md overflow-hidden flex-shrink-0">
              {tutor.tutorImage ? (
                <img src={tutor.tutorImage} alt={tutor.tutorName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-lime-100 flex items-center justify-center text-5xl font-bold text-green-800">
                  {tutor.tutorName?.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="pb-2">
              <h1 className="text-3xl font-bold text-green-950 tracking-tight flex items-center gap-3">
                {tutor.tutorName}
                {tutor.status === 'approved' && (
                  <span className="w-5 h-5 bg-lime-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm" title="Verified">
                     <svg className="w-3 h-3 text-green-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                )}
              </h1>
              <p className="text-green-700 text-lg mt-1 font-medium">
                {tutor.qualification} Student at <span className="font-bold text-green-900">{tutor.institution}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6 md:mt-4">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-green-900 text-lime-300 rounded-xl font-bold text-sm hover:bg-green-800 transition shadow-sm">
              <FiHeart className="w-4 h-4" /> Save
            </button>
            <button className="p-2.5 bg-white border border-green-200 text-green-700 rounded-xl hover:bg-green-50 transition shadow-sm">
              <FiShare className="w-4 h-4" />
            </button>
            <button className="p-2.5 bg-white border border-green-200 text-green-700 rounded-xl hover:bg-green-50 transition shadow-sm">
              <FiMoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="space-y-8">
            
            {/* Navigation Tabs */}
            <div className="flex gap-8 border-b border-green-200 text-sm font-bold">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`pb-3 transition-colors ${activeTab === 'overview' ? 'border-b-2 border-green-700 text-green-900' : 'text-green-500 hover:text-green-800'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 transition-colors ${activeTab === 'reviews' ? 'border-b-2 border-green-700 text-green-900' : 'text-green-500 hover:text-green-800'}`}
              >
                Reviews <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded-md text-[10px]">New</span>
              </button>
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-10 animate-in fade-in duration-300">
                {/* Bio */}
                <div>
                  <p className="text-green-800/90 leading-relaxed whitespace-pre-line text-[15px] font-medium">
                    {tutor.bio}
                  </p>
                </div>

                {/* Profile Insights Cards */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-green-950">Profile Insights</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border border-green-200 bg-white shadow-sm">
                      <div className="flex items-center gap-2 text-green-600 font-bold mb-2">
                        <FiCheckCircle className="w-5 h-5" /> Verified Educator
                      </div>
                      <p className="text-sm text-green-700/80 leading-snug font-medium">
                        Institution and identity fully verified by our platform.
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl border border-green-200 bg-white shadow-sm">
                      <div className="flex items-center gap-2 text-lime-600 font-bold mb-2">
                        <BsLightningChargeFill className="w-5 h-5" /> Top Performer
                      </div>
                      <p className="text-sm text-green-700/80 leading-snug font-medium">
                        Highly responsive mentor with great communication.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Experience / Details Section */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-bold text-green-950">Experience & Subjects</h3>
                  
                  <div className="rounded-2xl border border-green-200 overflow-hidden bg-white shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center py-4 px-5 border-b border-green-100">
                      <span className="w-32 text-green-600 font-bold text-sm">Expertise</span>
                      <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                        {tutor.subjects?.map(sub => (
                          <span key={sub} className="px-3 py-1 bg-lime-100 text-green-800 rounded-lg text-xs font-bold border border-lime-200">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center py-4 px-5 border-b border-green-100">
                      <span className="w-32 text-green-600 font-bold text-sm">Teaching Mode</span>
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-1.5 text-xs font-bold">
                          <FiBook className="w-3 h-3" /> {tutor.teachingMode}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row py-4 px-5">
                      <span className="w-32 text-green-600 font-bold text-sm">Background</span>
                      <div className="text-sm font-bold text-green-900 space-y-2 mt-2 sm:mt-0">
                        <div className="flex items-center gap-2"><FiMapPin className="text-lime-500 w-4 h-4" /> {tutor.location}</div>
                        <div className="flex items-center gap-2"><FiCompass className="text-lime-500 w-4 h-4" /> {tutor.experience} Years Experience</div>
                        <div className="flex items-center gap-2"><FaLanguage className="text-lime-500 w-4 h-4" /> Fluent in {tutor.language}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="animate-in fade-in zoom-in-95 duration-300 pt-4">
                <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-green-200 shadow-sm">
                  <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-lime-500">
                    <FiMessageSquare size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-green-950 mb-2">Student Reviews</h3>
                  <p className="text-green-600 font-medium max-w-sm mb-8">
                    We are currently building our integrated review system. Soon you will be able to read and write feedback for {tutor.tutorName}.
                  </p>
                  <button className="flex items-center gap-2 px-6 py-3 bg-lime-300 hover:bg-lime-400 text-green-950 font-bold rounded-xl transition-colors shadow-sm">
                    <BsStars /> Add a Review
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ================= RIGHT COLUMN (SIDEBAR) ================= */}
          <div className="space-y-6">
            
            {/* Quick Stats */}
            <div className="p-6 rounded-3xl border border-green-200 bg-white shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-bold uppercase tracking-wider">Session Rate</p>
                <p className="text-3xl font-bold text-green-950 flex items-center gap-1 mt-1">
                  ${tutor.hourlyRate} <span className="text-sm font-semibold text-green-500">/ hr</span>
                </p>
              </div>
              <div className="w-14 h-14 bg-lime-100 rounded-2xl flex items-center justify-center text-lime-600 border border-lime-200">
                <BsStars className="w-7 h-7" />
              </div>
            </div>

            {/* Booking Widget Container */}
            <div className="p-6 rounded-3xl border border-green-200 bg-white shadow-sm">
              <h3 className="text-xl font-bold text-green-950 mb-1">Available Sessions</h3>
              <p className="text-sm font-semibold text-green-500 mb-6 flex items-center gap-1.5">
                <FiClock className="w-4 h-4" /> Based on your local timezone
              </p>

              {/* Custom Date Carousel (Swipeable) */}
              <div className="flex items-center gap-2 mb-6">
                <button onClick={() => scrollDates('left')} className="p-2 rounded-xl hover:bg-green-50 text-green-600 transition-colors">
                  <FiChevronLeft className="w-5 h-5"/>
                </button>
                
                {/* Scrollable Container */}
                <div 
                  ref={dateCarouselRef}
                  className="flex gap-3 overflow-x-auto snap-x scroll-smooth py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {availableDates.map((d, idx) => {
                    const isSelected = selectedDate?.dateStr === d.dateStr;
                    return (
                      <button
                        key={idx}
                        onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                        className={`flex flex-col items-center min-w-[72px] p-3 rounded-2xl border-2 transition-all snap-start shrink-0 ${
                          isSelected 
                            ? 'border-lime-400 bg-green-50 text-green-900 shadow-sm' 
                            : 'border-green-100 bg-white text-green-600 hover:border-lime-200'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest">{d.dayStr}</span>
                        <span className={`text-sm font-bold mt-1 ${isSelected ? 'text-green-950' : 'text-green-800'}`}>
                          {d.dateStr}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button onClick={() => scrollDates('right')} className="p-2 rounded-xl hover:bg-green-50 text-green-600 transition-colors">
                  <FiChevronRight className="w-5 h-5"/>
                </button>
              </div>

              {/* Time Slots Grid */}
              <div className="mb-8">
                <p className="text-sm font-bold text-green-800 mb-3 uppercase tracking-wider">Time Slots</p>
                {timesForSelectedDate.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {timesForSelectedDate.map((time, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                          selectedTime === time 
                            ? 'bg-green-900 border-green-900 text-lime-300 shadow-sm' 
                            : 'bg-white border-green-100 text-green-800 hover:border-lime-300 hover:bg-green-50'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-green-600 bg-green-50/50 p-4 rounded-xl border border-green-100 text-center">
                    No slots available on this date.
                  </p>
                )}
              </div>

              {/* Call to Action Book Button */}
              <button
                onClick={handleBookSession}
                disabled={!selectedTime || bookingLoading}
                className="w-full py-4 rounded-2xl bg-lime-300 hover:bg-lime-400 disabled:bg-green-100 disabled:text-green-400 text-green-950 font-bold text-sm transition-all shadow-sm"
              >
                {bookingLoading ? 'Processing...' : selectedTime ? `Confirm ${selectedTime} Session` : 'Select a time to book'}
              </button>
              
            </div>
            
          </div>
        </div>
      </div>
    </main>
  );
}