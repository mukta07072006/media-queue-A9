'use client';

import React, { useEffect, useState } from 'react';
import { Parkinsans } from 'next/font/google';
import { Highlight } from '@/components/reusablecomp/Highlight';
import {
  User, GraduationCap, BookOpen,
  Clock, FileText, Camera, ArrowRight, CheckCircle, LayoutDashboard, Hourglass,
} from 'lucide-react';
import { API_URL } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { redirect, useRouter } from 'next/navigation';

const parkinsans = Parkinsans({ subsets: ['latin'], display: 'swap' });

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM',
];
const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Bangla', 'History', 'Geography', 'Computer Science', 'Economics',
  'Accounting', 'Statistics', 'Islamic Studies', 'Arabic', 'Other',
];
const QUALIFICATIONS = [
  'SSC', 'HSC', 'Diploma', "Bachelor's", "Master's", 'PhD', 'Professional Cert',
];
const TEACHING_MODES = ['Online', 'Offline', 'Both'];

const steps = [
  { icon: User,          label: 'Personal Info' },
  { icon: GraduationCap, label: 'Education' },
  { icon: BookOpen,      label: 'Teaching' },
  { icon: Clock,         label: 'Availability' },
  { icon: FileText,      label: 'Bio & Review' },
];


function PendingScreen({ name }) {
  return (
    <main className={`${parkinsans.className} min-h-screen bg-green-50 flex items-center justify-center px-4`}>
      <div className="w-full max-w-lg">
        <div className="bg-white border-[1.5px] border-amber-100 rounded-3xl p-10 text-center shadow-sm">
          <div className="relative w-24 h-24 mx-auto mb-7">
            <div className="absolute inset-0 rounded-3xl bg-amber-100 animate-pulse" />
            <div className="relative w-24 h-24 rounded-3xl bg-amber-50 border-[1.5px] border-amber-200 flex items-center justify-center">
              <Hourglass size={36} className="text-amber-500" />
            </div>
          </div>

          <span className={`${parkinsans.className} inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 mb-5`}>
            ● Under Review
          </span>

          <h2 className={`${parkinsans.className} text-3xl font-bold text-green-900 mb-3`}>
            Application Pending
          </h2>
          <p className={`${parkinsans.className} text-green-600 text-sm leading-relaxed mb-8`}>
            Hi <span className="font-semibold text-green-900">{name}</span>, your application is currently under review. Our team carefully evaluates each submission and will get back to you within{' '}
            <span className="font-semibold text-green-900">2–3 business days</span>.
          </p>

          <div className="bg-amber-50 border-[1.5px] border-amber-100 rounded-2xl p-5 text-left space-y-4">
            {[
              { step: 'Application submitted',   done: true,  label: 'Complete' },
              { step: 'Profile under review',    done: true,  label: 'In Progress' },
              { step: 'Decision sent via email', done: false, label: 'Pending' },
              { step: 'Access granted',          done: false, label: 'Pending' },
            ].map(({ step, done, label }) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-[1.5px] ${done ? 'bg-lime-300 border-lime-400' : 'bg-white border-amber-200'}`}>
                  {done
                    ? <CheckCircle size={12} className="text-green-900" />
                    : <div className="w-2 h-2 rounded-full bg-amber-300" />
                  }
                </div>
                <span className={`${parkinsans.className} text-sm text-green-800 flex-1`}>{step}</span>
                <span className={`${parkinsans.className} text-[10px] font-bold px-2 py-0.5 rounded-full ${done ? 'bg-lime-200 text-green-800' : 'bg-amber-100 text-amber-700'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <p className={`${parkinsans.className} text-xs text-green-400 mt-6`}>
            We'll notify you at your registered email address.
          </p>
        </div>
      </div>
    </main>
  );
}

function ApprovedScreen({ name, router }) {
  return (
    <main className={`${parkinsans.className} min-h-screen bg-green-50 flex items-center justify-center px-4`}>
      <div className="w-full max-w-lg">
        <div className="bg-white border-[1.5px] border-lime-200 rounded-3xl p-10 text-center shadow-sm">
          <div className="flex justify-center gap-1.5 mb-7">
            {['bg-lime-300', 'bg-green-400', 'bg-emerald-300', 'bg-lime-400', 'bg-green-300'].map((c, i) => (
              <div key={i} className={`${c} rounded-full`} style={{ width: 8, height: 8 + i * 4 }} />
            ))}
          </div>

          <div className="w-24 h-24 mx-auto mb-7 rounded-3xl bg-lime-300 flex items-center justify-center">
            <CheckCircle size={40} className="text-green-900" />
          </div>

          <span className={`${parkinsans.className} inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-lime-200 text-green-800 border border-lime-300 mb-5`}>
            ✓ Application Approved
          </span>

          <h2 className={`${parkinsans.className} text-3xl font-bold text-green-900 mb-3`}>
            Welcome aboard, {name.split(' ')[0]}! 🎉
          </h2>
          <p className={`${parkinsans.className} text-green-600 text-sm leading-relaxed mb-8`}>
            Your tutor application has been <span className="font-semibold text-green-900">approved</span>. Your profile is now live and students can start booking sessions with you.
          </p>

          <div className="bg-green-50 border-[1.5px] border-green-100 rounded-2xl p-5 text-left space-y-3 mb-8">
            {[
              'Your tutor profile is now visible to students',
              'Students can book sessions based on your availability',
              'Manage sessions and earnings from your dashboard',
            ].map((perk) => (
              <div key={perk} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-lime-300 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle size={11} className="text-green-900" />
                </div>
                <span className={`${parkinsans.className} text-sm text-green-800`}>{perk}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className={`${parkinsans.className} w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-green-900 text-white font-bold text-sm hover:bg-green-800 transition-all`}
          >
            <LayoutDashboard size={16} />
            Go to Dashboard
            <div className="w-7 h-7 rounded-full bg-lime-300 flex items-center justify-center">
              <ArrowRight size={13} className="text-green-900" />
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}

function SubmittedScreen() {
  return (
    <main className={`${parkinsans.className} min-h-screen bg-green-50 flex items-center justify-center px-4`}>
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-lime-300 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={36} className="text-green-900" />
        </div>
        <h2 className={`${parkinsans.className} text-4xl font-bold text-green-900 mb-3`}>
          Application Submitted!
        </h2>
        <p className={`${parkinsans.className} text-green-600 text-sm leading-relaxed`}>
          Thanks for applying. Our team will review your profile and get back to you within 2–3 business days.
        </p>
      </div>
    </main>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function BecomeTutorPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // ── ALL hooks declared unconditionally at the top ─────────────
  const [currentStep, setCurrentStep]             = useState(0);
  const [submitted, setSubmitted]                 = useState(false);
  const [loading, setLoading]                     = useState(false);
  const [checkingStatus, setCheckingStatus]       = useState(true);
  const [error, setError]                         = useState('');
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [selectedDays, setSelectedDays]           = useState([]);
  const [selectedTimes, setSelectedTimes]         = useState([]);
  const [form, setForm]                           = useState({
    tutorName:        '',
    tutorEmail:       '',
    phone:            '',
    location:         '',
    tutorImage:       '',
    qualification:    '',
    institution:      '',
    graduationYear:   '',
    subjects:         [],
    teachingMode:     '',
    experience:       '',
    hourlyRate:       '',
    language:         '',
    slots:            {},
    sessionStartDate: '',
    sessionEndDate:   '',
    bio:              '',
    whyTeach:         '',
    isApproved:       false,
    status:           'pending',
    isApplied:        true,
  });

  // Sync session data into form once session loads
  useEffect(() => {
    if (session?.user) {
      setForm((f) => ({
        ...f,
        tutorName:  session.user.name  ?? f.tutorName,
        tutorEmail: session.user.email ?? f.tutorEmail,
      }));
    }
  }, [session]);

  

  useEffect(() => {
    if (!session?.user?.email) return;

    const checkSubmission = async () => {
      setCheckingStatus(true);
      try {
        const res = await fetch(`${API_URL}/api/tutors/email/${session.user.email}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.status) {
            setApplicationStatus(data.status);
          }
        }
      } catch {
        // network error — fall through to show the form
      } finally {
        setCheckingStatus(false);
      }
    };

    checkSubmission();
  }, [session]);

  // ── Derived values ────────────────────────────────────────────
  const builtSlots = selectedDays.reduce((acc, day) => {
    acc[day] = selectedTimes;
    return acc;
  }, {});
  const totalSlots = selectedDays.length * selectedTimes.length;

  // ── Handlers ─────────────────────────────────────────────────
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleDay = (day) =>
    setSelectedDays((d) => d.includes(day) ? d.filter((x) => x !== day) : [...d, day]);

  const toggleTime = (time) =>
    setSelectedTimes((t) => t.includes(time) ? t.filter((x) => x !== time) : [...t, time]);

  const toggleSubject = (s) =>
    set('subjects', form.subjects.includes(s)
      ? form.subjects.filter((x) => x !== s)
      : [...form.subjects, s]
    );

  const handleSubmit = async () => {
    const { data: tokenData } = await authClient.token();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/tutors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ ...form, slots: builtSlots }),
      });
      if (!res.ok) throw new Error('Submission failed. Please try again.');
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (isPending || checkingStatus) {
    return (
      <div className={`${parkinsans.className} min-h-screen bg-green-50 flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-lime-300 animate-pulse" />
          <p className="text-green-600 text-sm font-semibold">Loading…</p>
        </div>
      </div>
    );
  }

  if (!session) return redirect('/signin');

  if (applicationStatus === 'pending')  return <PendingScreen  name={session.user.name} />;
  if (applicationStatus === 'approved') return <ApprovedScreen name={session.user.name} router={router} />;
  if (submitted)                        return <SubmittedScreen />;

  

  const inputCls  = `${parkinsans.className} w-full px-4 py-3 text-sm bg-white border-[1.5px] border-green-200 rounded-2xl focus:outline-none focus:border-green-500 transition text-green-900 placeholder:text-green-400`;
  const lockedCls = `${parkinsans.className} w-full px-4 py-3 text-sm bg-gray-50 cursor-not-allowed border-[1.5px] border-green-100 rounded-2xl text-green-700`;
  const labelCls  = `${parkinsans.className} block text-[11px] font-bold text-green-600 uppercase tracking-widest mb-1.5`;

  return (
    <main className={`${parkinsans.className} min-h-screen bg-green-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[360px_1fr] gap-8 items-start">

          {/* LEFT PANEL */}
          <div className="lg:sticky lg:top-24 bg-green-950 rounded-3xl p-8 text-white space-y-8">
            <div>
              <span className={`${parkinsans.className} inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-lime-400/20 text-lime-300 border border-lime-400/30 mb-4`}>
                Join as Educator
              </span>
              <h1 className={`${parkinsans.className} text-4xl font-bold leading-tight`}>
                Start <Highlight>Teaching.</Highlight><br />
                Change Lives.
              </h1>
              <p className={`${parkinsans.className} text-green-400 text-sm mt-4 leading-relaxed`}>
                Share your knowledge with motivated students and build a flexible teaching career on your own terms.
              </p>
            </div>

            <div className="space-y-3">
              {steps.map((s, i) => {
                const Icon   = s.icon;
                const done   = i < currentStep;
                const active = i === currentStep;
                return (
                  <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${active ? 'bg-lime-300/20 border border-lime-400/30' : 'opacity-40'}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${done ? 'bg-lime-400' : active ? 'bg-lime-300/30' : 'bg-white/10'}`}>
                      {done
                        ? <CheckCircle size={15} className="text-green-900" />
                        : <Icon size={15} className={active ? 'text-lime-400' : 'text-white/40'} />
                      }
                    </div>
                    <span className={`${parkinsans.className} text-sm font-semibold ${active ? 'text-white' : 'text-white/40'}`}>
                      {s.label}
                    </span>
                    {active && (
                      <span className={`${parkinsans.className} ml-auto text-[10px] font-bold text-white/60`}>
                        {i + 1}/{steps.length}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="bg-white border-[1.5px] border-green-100 rounded-3xl p-8">

            {/* STEP 0 — Personal */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <p className={`${parkinsans.className} text-[11px] font-bold text-green-500 uppercase tracking-widest mb-1`}>Step 1 of 5</p>
                  <h2 className={`${parkinsans.className} text-3xl font-bold text-green-900`}>Personal Information</h2>
                  <p className={`${parkinsans.className} text-sm text-green-400 mt-1`}>Tell students who you are.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Full Name *</label>
                    <input readOnly className={lockedCls} value={session.user.name} />
                  </div>
                  <div>
                    <label className={labelCls}>Email *</label>
                    <input readOnly className={lockedCls} value={session.user.email} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number</label>
                    <input className={inputCls} placeholder="+880 1XXX-XXXXXX" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Location</label>
                    <input className={inputCls} placeholder="e.g. Chattogram, Bangladesh" value={form.location} onChange={(e) => set('location', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Profile Photo URL</label>
                  <div className="flex gap-3 items-center">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 border-[1.5px] border-green-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {form.tutorImage
                        ? <img src={form.tutorImage} className="w-full h-full object-cover" alt="preview" />
                        : <Camera size={20} className="text-green-300" />
                      }
                    </div>
                    <input className={inputCls} placeholder="https://..." value={form.tutorImage} onChange={(e) => set('tutorImage', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1 — Education */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <p className={`${parkinsans.className} text-[11px] font-bold text-green-500 uppercase tracking-widest mb-1`}>Step 2 of 5</p>
                  <h2 className={`${parkinsans.className} text-3xl font-bold text-green-900`}>Education</h2>
                  <p className={`${parkinsans.className} text-sm text-green-400 mt-1`}>Your academic background builds trust.</p>
                </div>

                <div>
                  <label className={labelCls}>Highest Qualification *</label>
                  <div className="flex flex-wrap gap-2">
                    {QUALIFICATIONS.map((q) => (
                      <button key={q} type="button" onClick={() => set('qualification', q)}
                        className={`${parkinsans.className} px-4 py-2 rounded-full text-sm font-semibold border-[1.5px] transition-all ${
                          form.qualification === q
                            ? 'bg-lime-300 border-lime-400 text-green-900'
                            : 'bg-green-50 border-green-200 text-green-700 hover:border-green-400'
                        }`}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Institution / University *</label>
                    <input className={inputCls} placeholder="e.g. University of Chittagong" value={form.institution} onChange={(e) => set('institution', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Graduation Year</label>
                    <input type="number" className={inputCls} placeholder="e.g. 2022" min="1990" max="2030" value={form.graduationYear} onChange={(e) => set('graduationYear', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 — Teaching */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <p className={`${parkinsans.className} text-[11px] font-bold text-green-500 uppercase tracking-widest mb-1`}>Step 3 of 5</p>
                  <h2 className={`${parkinsans.className} text-3xl font-bold text-green-900`}>Teaching Details</h2>
                  <p className={`${parkinsans.className} text-sm text-green-400 mt-1`}>Let students know what you teach and how.</p>
                </div>

                <div>
                  <label className={labelCls}>Subjects You Teach * <span className="normal-case font-normal text-green-400">(select all that apply)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map((s) => (
                      <button key={s} type="button" onClick={() => toggleSubject(s)}
                        className={`${parkinsans.className} px-4 py-2 rounded-full text-sm font-semibold border-[1.5px] transition-all ${
                          form.subjects.includes(s)
                            ? 'bg-lime-300 border-lime-400 text-green-900'
                            : 'bg-green-50 border-green-200 text-green-700 hover:border-green-400'
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Teaching Mode *</label>
                  <div className="flex gap-3">
                    {TEACHING_MODES.map((m) => (
                      <button key={m} type="button" onClick={() => set('teachingMode', m)}
                        className={`${parkinsans.className} flex-1 py-3 rounded-2xl text-sm font-bold border-[1.5px] transition-all ${
                          form.teachingMode === m
                            ? 'bg-lime-300 border-lime-400 text-green-900'
                            : 'bg-green-50 border-green-200 text-green-700 hover:border-green-400'
                        }`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className={labelCls}>Years of Experience</label>
                    <input type="number" className={inputCls} placeholder="e.g. 3" min="0" max="50" value={form.experience} onChange={(e) => set('experience', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Hourly Rate (USD)</label>
                    <input type="number" className={inputCls} placeholder="e.g. 15" min="1" value={form.hourlyRate} onChange={(e) => set('hourlyRate', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Teaching Language</label>
                    <input className={inputCls} placeholder="e.g. Bangla, English" value={form.language} onChange={(e) => set('language', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 — Availability */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div>
                  <p className={`${parkinsans.className} text-[11px] font-bold text-green-500 uppercase tracking-widest mb-1`}>Step 4 of 5</p>
                  <h2 className={`${parkinsans.className} text-3xl font-bold text-green-900`}>Available Slots</h2>
                  <p className={`${parkinsans.className} text-sm text-green-400 mt-1`}>
                    Pick your days, then choose the times — they apply to every selected day.
                  </p>
                </div>

                <div>
                  <label className={labelCls}>Which days are you available? *</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {DAYS.map((day) => (
                      <button key={day} type="button" onClick={() => toggleDay(day)}
                        className={`${parkinsans.className} px-5 py-2.5 rounded-full text-sm font-bold border-[1.5px] transition-all ${
                          selectedDays.includes(day)
                            ? 'bg-green-900 text-white border-green-900'
                            : 'bg-green-50 text-green-800 border-green-200 hover:border-green-400'
                        }`}>
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDays.length > 0 && (
                  <div>
                    <label className={labelCls}>
                      What times are you free?{' '}
                      <span className="normal-case font-normal text-green-400">
                        (applies to: {selectedDays.join(', ')})
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {TIMES.map((time) => (
                        <button key={time} type="button" onClick={() => toggleTime(time)}
                          className={`${parkinsans.className} px-4 py-2 rounded-full text-sm font-semibold border-[1.5px] transition-all ${
                            selectedTimes.includes(time)
                              ? 'bg-lime-300 border-lime-400 text-black'
                              : 'bg-green-50 text-green-800 border-green-200 hover:border-green-400'
                          }`}>
                          {time}
                        </button>
                      ))}
                    </div>
                    {totalSlots > 0 && (
                      <p className={`${parkinsans.className} text-xs text-green-600 mt-3 font-semibold`}>
                        {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''} ×{' '}
                        {selectedTimes.length} time{selectedTimes.length !== 1 ? 's' : ''} ={' '}
                        <span className="text-green-900 font-bold">{totalSlots} total slots</span>
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Session Start Date</label>
                    <input type="date" className={inputCls} value={form.sessionStartDate} onChange={(e) => set('sessionStartDate', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Session End Date</label>
                    <input type="date" className={inputCls} value={form.sessionEndDate} onChange={(e) => set('sessionEndDate', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 — Bio & Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <p className={`${parkinsans.className} text-[11px] font-bold text-green-500 uppercase tracking-widest mb-1`}>Step 5 of 5</p>
                  <h2 className={`${parkinsans.className} text-3xl font-bold text-green-900`}>Bio & Review</h2>
                  <p className={`${parkinsans.className} text-sm text-green-400 mt-1`}>Almost there — write a short intro for your profile.</p>
                </div>

                <div>
                  <label className={labelCls}>Your Bio *</label>
                  <textarea rows={4} className={`${inputCls} resize-none`}
                    placeholder="Tell students about your teaching style, background, and what makes your sessions effective..."
                    value={form.bio} onChange={(e) => set('bio', e.target.value)} />
                </div>

                <div>
                  <label className={labelCls}>Why do you want to teach?</label>
                  <textarea rows={3} className={`${inputCls} resize-none`}
                    placeholder="Share your motivation..."
                    value={form.whyTeach} onChange={(e) => set('whyTeach', e.target.value)} />
                </div>

                <div className="bg-green-50 border-[1.5px] border-green-200 rounded-2xl p-5 space-y-3">
                  <p className={`${parkinsans.className} text-xs font-bold text-green-600 uppercase tracking-widest`}>Profile Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {[
                      ['Name',           form.tutorName],
                      ['Email',          form.tutorEmail],
                      ['Qualification',  form.qualification],
                      ['Institution',    form.institution],
                      ['Subjects',       form.subjects.join(', ') || '—'],
                      ['Mode',           form.teachingMode],
                      ['Rate',           form.hourlyRate ? `$${form.hourlyRate}/hr` : '—'],
                      ['Slots selected', String(totalSlots)],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <span className={`${parkinsans.className} text-green-500 text-xs`}>{k}</span>
                        <p className={`${parkinsans.className} font-semibold text-green-900 text-sm truncate`}>{v || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <p className={`${parkinsans.className} text-sm text-red-500 bg-red-50 border border-red-100 rounded-2xl px-4 py-3`}>
                    {error}
                  </p>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className={`flex mt-8 ${currentStep > 0 ? 'justify-between' : 'justify-end'}`}>
              {currentStep > 0 && (
                <button type="button" onClick={() => setCurrentStep((s) => s - 1)}
                  className={`${parkinsans.className} px-6 py-3 rounded-full border-[1.5px] border-green-200 text-green-700 font-bold text-sm hover:bg-green-50 transition-all`}>
                  ← Back
                </button>
              )}

              {currentStep < steps.length - 1 ? (
                <button type="button" onClick={() => setCurrentStep((s) => s + 1)}
                  className={`${parkinsans.className} flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-700 text-white font-bold text-sm hover:bg-green-900 transition-all`}>
                  Continue
                  <div className="w-7 h-7 rounded-full bg-lime-300 flex items-center justify-center">
                    <ArrowRight size={14} className="text-green-900" />
                  </div>
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={loading}
                  className={`${parkinsans.className} flex items-center gap-3 px-6 py-3 rounded-full bg-lime-300 text-green-900 font-bold text-sm hover:bg-lime-400 transition-all disabled:opacity-60`}>
                  {loading ? 'Submitting…' : 'Submit Application'}
                  <div className="w-7 h-7 rounded-full bg-green-900 flex items-center justify-center">
                    <CheckCircle size={14} className="text-lime-300" />
                  </div>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}