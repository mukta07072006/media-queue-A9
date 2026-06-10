'use client';

import { Parkinsans } from 'next/font/google';
import {
  UserPlus,
  CheckCircle,
  CalendarDays,
  Search,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Highlight } from './reusablecomp/Highlight';

const parkinsans = Parkinsans({
  subsets: ['latin'],
  display: 'swap',
});

const tutorSteps = [
  {
    icon: UserPlus,
    label: 'Step 01',
    title: 'Apply as Tutor',
    description:
      'Create your profile, add your expertise, experience, and teaching specialties.',
  },
  {
    icon: CheckCircle,
    label: 'Step 02',
    title: 'Get Approved',
    description:
      'Our team reviews your application to ensure students learn from trusted educators.',
  },
  {
    icon: CalendarDays,
    label: 'Step 03',
    title: 'Create Time Slots',
    description:
      'Set your availability and publish bookable time slots for students.',
  },
];

const studentSteps = [
  {
    icon: Search,
    label: 'Step 01',
    title: 'Find a Tutor',
    description:
      'Browse tutor profiles, subjects, expertise, and availability.',
  },
  {
    icon: CalendarDays,
    label: 'Step 02',
    title: 'Choose a Slot',
    description:
      'Select an available session that matches your schedule.',
  },
  {
    icon: BookOpen,
    label: 'Step 03',
    title: 'Start Learning',
    description:
      'Join your booked session and receive personalized guidance.',
  },
];

function StepList({ steps }) {
  return (
    <div className={`flex flex-col ${parkinsans.className}`}>
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="relative flex gap-5">
            {!isLast && (
              <div className="absolute left-[22px] top-12 bottom-0 w-px bg-green-200" />
            )}

            <div className="relative z-10 w-11 h-11 shrink-0 rounded-full bg-green-50 border border-green-300 flex items-center justify-center">
              <Icon size={18} className="text-green-700" />
            </div>

            <div className={`${isLast ? '' : 'pb-8'} flex-1`}>
              <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-green-600 mb-1">
                {step.label}
              </p>

              <h4
                className={`${parkinsans.className} text-lg font-bold text-green-900 mb-2`}
              >
                {step.title}
              </h4>

              <p className="text-sm leading-relaxed text-green-700/80">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function WorkflowSection() {
  return (
    <section className="bg-green-50 py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">

          <h2
            className={`${parkinsans.className} mt-6 text-5xl md:text-6xl font-semibold text-green-950`}
          >
            Learn Faster.
            <br />
            <Highlight>Teach Smarter.</Highlight>
          </h2>

          <p
            className={`${parkinsans.className} mt-5 text-lg text-green-800/80 max-w-2xl mx-auto`}
          >
            A simple booking platform where teachers share their expertise and
            students connect with the perfect tutor in just a few clicks.
          </p>
        </div>

        {/* Workflow Cards */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Tutor Side */}
          <div className="bg-white p-8 rounded-3xl border-2 border-lime-300 ">
            <div className="mb-10">
              <span
                className={`${parkinsans.className} text-sm uppercase tracking-widest font-bold text-green-600`}
              >
                Teachers
              </span>

              <h3
                className={`${parkinsans.className} text-4xl md:text-5xl font-bold text-green-950 mt-2`}
              >
                Become a Tutor
              </h3>

              <p className={`mt-3 text-green-700 text-base ${parkinsans.className}`}>
                Apply, get verified, and start teaching students online.
              </p>
            </div>

            <StepList steps={tutorSteps} />
          </div>

          {/* Student Side */}
          <div className="bg-white p-8 rounded-3xl border-2 border-lime-300 ">
            <div className="mb-10">
              <span
                className={`${parkinsans.className} text-sm uppercase tracking-widest font-bold text-green-600`}
              >
                Students
              </span>

              <h3
                className={`${parkinsans.className} text-4xl md:text-5xl font-bold text-green-950 mt-2`}
              >
                Book a Tutor
              </h3>

              <p className={`mt-3 text-green-700 text-base ${parkinsans.className}`}>
                Find available tutors, choose a slot, and start learning.
              </p>
            </div>

            <StepList steps={studentSteps} />
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-14">
          <button
            className={`${parkinsans.className} px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold flex items-center gap-5 transition-all hover:gap-7`}
          >
            Get Started

            <div className="w-9 h-9 rounded-full bg-lime-300 flex items-center justify-center">
              <ArrowRight size={18} className="text-black" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}