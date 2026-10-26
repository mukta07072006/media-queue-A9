'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import { Parkinsans } from 'next/font/google';
import {
  FiMapPin,
  FiShare,
  FiHeart,
  FiMoreHorizontal,
  FiChevronRight,
  FiChevronLeft,
  FiCheck,
  FiBook,
  FiClock,
  FiMessageSquare,
  FiStar,
  FiDollarSign,
  FiBriefcase,
  FiGlobe,
} from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';
import toast from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import { API_URL } from '@/lib/api';

const API = API_URL;
const parkinsans = Parkinsans({ subsets: ['latin'], display: 'swap' });

// Shared surface style for every card on the page
const CARD =
  'rounded-[2rem] bg-white shadow-[0_10px_30px_-12px_rgba(20,83,45,0.25)] ring-1 ring-green-900/5';

/* ---------- Default cover (same generator as the tutor card) ----------
   Seeded by _id, so the profile cover matches the card the student clicked. */

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

// Helper: Get next 14 available dates based on tutor's slot schedule
const generateAvailableDates = (slotsMap) => {
  if (!slotsMap) return [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
        fullDate: currentDate.toISOString(),
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates.slice(0, 10);
};

/* ---------- Small pieces ---------- */

function Stat({ tint, icon, value, label }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${tint}`}
      >
        {icon}
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-base font-bold text-green-950">{value}</p>
        <p className="mt-1 text-xs text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function Detail({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 rounded-2xl p-4 ring-1 ring-inset ring-green-100">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime-100 text-green-700">
        {icon}
      </span>
      <div className="min-w-0 leading-tight">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="mt-1 truncate text-sm font-bold text-green-950">{value}</p>
      </div>
    </div>
  );
}

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

  if (loading || sessionLoading)
    return (
      <div
        className={`${parkinsans.className} flex min-h-screen items-center justify-center bg-[#f3f6f2]`}
      >
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-900 border-t-transparent" />
      </div>
    );

  if (!tutor)
    return (
      <div
        className={`${parkinsans.className} flex min-h-screen items-center justify-center bg-[#f3f6f2] font-bold text-green-700`}
      >
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
  const extraSubjects = (tutor.subjects?.length || 0) - 1;
  const glassBtn =
    'flex items-center justify-center rounded-full bg-white/90 text-green-950 ring-1 ring-black/5 backdrop-blur transition-colors hover:bg-white';

  return (
    <main className={`${parkinsans.className} min-h-screen bg-[#f3f6f2] pb-16`}>
      <div className="mx-auto max-w-[1100px] px-4 pt-6 sm:px-6">
        {/* ================= HERO ================= */}
        <section className={`${CARD} p-2.5`}>
          <div className="relative">
            <div
              className="h-40 rounded-3xl sm:h-52"
              style={coverStyle(tutor._id ?? tutor.tutorName)}
            />

            {/* Actions */}
            <div className="absolute right-3 top-3 flex items-center gap-2">
              <button className={`${glassBtn} gap-1.5 px-4 py-2 text-sm font-bold`}>
                <FiHeart className="h-4 w-4" /> Save
              </button>
              <button aria-label="Share" className={`${glassBtn} h-9 w-9`}>
                <FiShare className="h-4 w-4" />
              </button>
              <button aria-label="More options" className={`${glassBtn} h-9 w-9`}>
                <FiMoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Avatar */}
            <div className="absolute bottom-0 left-5 translate-y-1/2">
              {tutor.tutorImage ? (
                <img
                  src={tutor.tutorImage}
                  alt={tutor.tutorName}
                  className="h-[112px] w-[112px] rounded-full bg-lime-100 object-cover ring-[6px] ring-white"
                />
              ) : (
                <div className="flex h-[112px] w-[112px] items-center justify-center rounded-full bg-lime-100 text-4xl font-bold text-green-800 ring-[6px] ring-white">
                  {tutor.tutorName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Subject pill */}
            {tutor.subjects?.[0] && (
              <span className="absolute bottom-0 right-4 inline-flex max-w-[55%] translate-y-1/2 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-bold text-green-950 shadow-[0_4px_14px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
                <FiBook className="h-4 w-4 shrink-0 text-lime-600" />
                <span className="truncate">{tutor.subjects[0]}</span>
                {extraSubjects > 0 && (
                  <span className="shrink-0 font-semibold text-slate-400">+{extraSubjects}</span>
                )}
              </span>
            )}
          </div>

          {/* Name + qualification */}
          <div className="px-4 pb-4 pt-[4.5rem] sm:px-5">
            <h1 className="flex items-center gap-2.5 text-2xl font-bold leading-tight tracking-tight text-green-950 sm:text-3xl">
              <span className="truncate">{tutor.tutorName}</span>
              {tutor.status === 'approved' && (
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-400 text-green-950"
                  title="Verified"
                >
                  <FiCheck className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              )}
            </h1>
            {(tutor.qualification || tutor.institution) && (
              <p className="mt-1.5 text-base font-medium text-slate-400">
                {tutor.qualification} student at{' '}
                <span className="font-bold text-green-800">{tutor.institution}</span>
              </p>
            )}

            {/* Stats */}
            <div className="mt-5 grid grid-cols-2 gap-5 border-t border-green-50 pt-5 sm:grid-cols-4">
              <Stat
                tint="bg-amber-400"
                icon={<FiStar className="h-3 w-3 fill-white" />}
                value={tutor.rating ? Number(tutor.rating).toFixed(1) : '—'}
                label="Rating"
              />
              <Stat
                tint="bg-blue-500"
                icon={<FiDollarSign className="h-3 w-3" />}
                value={tutor.hourlyRate ? `$${tutor.hourlyRate}` : '—'}
                label="per hour"
              />
              <Stat
                tint="bg-purple-500"
                icon={<FiBriefcase className="h-3 w-3" />}
                value={tutor.experience ?? '—'}
                label="Years experience"
              />
              <Stat
                tint="bg-green-500"
                icon={<FiBook className="h-3 w-3" />}
                value={tutor.teachingMode || '—'}
                label="Teaching mode"
              />
            </div>
          </div>
        </section>

        {/* ================= MAIN GRID ================= */}
        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_380px]">
          {/* ---------- LEFT: tabs + content ---------- */}
          <div className={`${CARD} p-6 sm:p-8`}>
            <div role="tablist" className="inline-flex rounded-full bg-slate-100 p-1 text-sm font-bold">
              <button
                role="tab"
                aria-selected={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
                className={`rounded-full px-5 py-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-white text-green-950 shadow-sm'
                    : 'text-slate-500 hover:text-green-900'
                }`}
              >
                Overview
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'reviews'}
                onClick={() => setActiveTab('reviews')}
                className={`flex items-center gap-2 rounded-full px-5 py-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'bg-white text-green-950 shadow-sm'
                    : 'text-slate-500 hover:text-green-900'
                }`}
              >
                Reviews
                <span className="rounded-full bg-lime-200 px-2 py-0.5 text-[10px] font-bold text-green-800">
                  New
                </span>
              </button>
            </div>

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="mt-8 space-y-8">
                {tutor.bio && (
                  <div>
                    <h2 className="mb-3 text-lg font-bold text-green-950">About</h2>
                    <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-600">
                      {tutor.bio}
                    </p>
                  </div>
                )}

                {tutor.status === 'approved' && (
                  <div className="flex items-start gap-3 rounded-2xl bg-lime-50 p-4 ring-1 ring-inset ring-lime-200">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime-300 text-green-950">
                      <FiCheck className="h-4 w-4" strokeWidth={3} />
                    </span>
                    <div className="leading-tight">
                      <p className="text-sm font-bold text-green-950">Verified educator</p>
                      <p className="mt-1 text-sm text-green-700">
                        Institution and identity verified by our platform.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="mb-3 text-lg font-bold text-green-950">Subjects & details</h2>
                  {tutor.subjects?.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {tutor.subjects.map((sub) => (
                        <span
                          key={sub}
                          className="rounded-full bg-lime-100 px-3.5 py-1.5 text-xs font-bold text-green-800 ring-1 ring-inset ring-lime-200"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Detail
                      icon={<FiMapPin className="h-4 w-4" />}
                      label="Location"
                      value={tutor.location}
                    />
                    <Detail
                      icon={<FiGlobe className="h-4 w-4" />}
                      label="Language"
                      value={tutor.language && `Fluent in ${tutor.language}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="mt-8 flex flex-col items-center rounded-3xl bg-slate-50 px-6 py-12 text-center">
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-lime-100 text-green-700">
                  <FiMessageSquare size={24} />
                </span>
                <h2 className="mb-2 text-xl font-bold text-green-950">Student reviews</h2>
                <p className="mb-7 max-w-sm text-sm leading-relaxed text-slate-500">
                  We are currently building our integrated review system. Soon you will be able to
                  read and write feedback for {tutor.tutorName}.
                </p>
                <button className="inline-flex items-center gap-2 rounded-2xl border border-green-100 bg-gradient-to-b from-white to-green-50 px-6 py-3 text-sm font-bold text-green-950 transition-colors hover:border-lime-300 hover:from-lime-50 hover:to-lime-100">
                  <BsStars className="text-lime-600" /> Add a review
                </button>
              </div>
            )}
          </div>

          {/* ---------- RIGHT: booking ---------- */}
          <aside className="lg:sticky lg:top-6">
            <div className={`${CARD} p-5 sm:p-6`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-green-950">Available sessions</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                    <FiClock className="h-3.5 w-3.5" /> Based on your local timezone
                  </p>
                </div>
                {tutor.hourlyRate && (
                  <p className="shrink-0 rounded-full bg-lime-100 px-3 py-1.5 text-sm font-bold text-green-900 ring-1 ring-inset ring-lime-200">
                    ${tutor.hourlyRate}
                    <span className="text-xs font-semibold text-green-600"> /hr</span>
                  </p>
                )}
              </div>

              {/* Date carousel */}
              {availableDates.length > 0 ? (
                <div className="mt-5 flex items-center gap-2">
                  <button
                    aria-label="Earlier dates"
                    onClick={() => scrollDates('left')}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-green-700 ring-1 ring-inset ring-green-100 transition-colors hover:bg-green-50"
                  >
                    <FiChevronLeft className="h-4 w-4" />
                  </button>

                  <div
                    ref={dateCarouselRef}
                    className="flex min-w-0 flex-1 snap-x gap-2.5 overflow-x-auto scroll-smooth py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {availableDates.map((d, idx) => {
                      const isSelected = selectedDate?.dateStr === d.dateStr;
                      return (
                        <button
                          key={idx}
                          aria-pressed={isSelected}
                          onClick={() => {
                            setSelectedDate(d);
                            setSelectedTime(null);
                          }}
                          className={`flex min-w-[68px] shrink-0 snap-start flex-col items-center rounded-2xl px-3 py-2.5 transition-colors ${
                            isSelected
                              ? 'bg-lime-300 text-green-950 ring-1 ring-inset ring-lime-400'
                              : 'bg-white text-green-700 ring-1 ring-inset ring-green-100 hover:ring-lime-300'
                          }`}
                        >
                          <span className="text-xs font-semibold">{d.dayStr}</span>
                          <span className="mt-1 text-sm font-bold">{d.dateStr}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    aria-label="Later dates"
                    onClick={() => scrollDates('right')}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-green-700 ring-1 ring-inset ring-green-100 transition-colors hover:bg-green-50"
                  >
                    <FiChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                  No upcoming availability.
                </p>
              )}

              {/* Time slots */}
              <div className="mt-6">
                <p className="mb-3 text-sm font-bold text-green-950">Time slots</p>
                {timesForSelectedDate.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    {timesForSelectedDate.map((time, i) => (
                      <button
                        key={i}
                        aria-pressed={selectedTime === time}
                        onClick={() => setSelectedTime(time)}
                        className={`rounded-2xl py-3 text-sm font-bold transition-colors ${
                          selectedTime === time
                            ? 'bg-green-900 text-lime-300'
                            : 'bg-white text-green-900 ring-1 ring-inset ring-green-100 hover:bg-lime-50 hover:ring-lime-300'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                    No slots available on this date.
                  </p>
                )}
              </div>

              {/* Confirm */}
              <button
                onClick={handleBookSession}
                disabled={!selectedTime || bookingLoading}
                className="mt-6 w-full rounded-2xl bg-lime-300 py-3.5 text-sm font-bold text-green-950 transition-colors hover:bg-lime-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-500 disabled:bg-slate-100 disabled:text-slate-400"
              >
                {bookingLoading
                  ? 'Processing...'
                  : selectedTime
                    ? `Confirm ${selectedTime} session`
                    : 'Select a time to book'}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}