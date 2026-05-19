'use client';
import { useState, useEffect } from 'react';
import { authClient } from "@/lib/auth-client";
import { redirect } from 'next/navigation';
import { FaLocationArrow } from 'react-icons/fa';

export default function MyTutorsPage() {



    const sampleMyTutors = [
        {
            _id: "t1_mock",
            subject: "Web Development (React & Next.js)",
            tutorImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80",
            bio: "Full-stack engineer specializing in declarative user interfaces, component lifecycle optimization, and modern server component patterns using Next.js.",
            location: "Chittagong (GEC Circle, Chattogram)",
            teachingMethod: "Online & Offline (Hybrid)",
            hourlyFee: 500,
            availableTime: "06:00 PM - 10:00 PM",
            totalSlot: 5,
        },
        {
            _id: "t2_mock",
            subject: "UI/UX Design & Frontend Prototyping",
            tutorImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
            bio: "Crafting minimalist, high-converting digital interfaces. Teaching atomic design structures, responsive layout configurations, and interactive design tools.",
            location: "Chittagong (Halishahar, Chattogram)",
            teachingMethod: "Online Live Classes",
            hourlyFee: 450,
            availableTime: "09:00 AM - 12:00 PM",
            totalSlot: 3,
        }
    ];

    // Practice targets: Write functions to handle updates and deletions
    const handleUpdateProfile = (tutorId) => {
        alert(`Practice Action Triggered!\nTutor ID: ${tutorId}\n\nTask: Route this to an update modal or form view page.`);
    };

    const handleDeleteProfile = (tutorId) => {
        alert(`Practice Action Triggered!\nTutor ID: ${tutorId}\n\nTask: Implement a fetch call with method: 'DELETE' targeting your express backend cleanup routines.`);
    };

    return (
        <div className="max-w-6xl mx-auto my-12 px-4 text-slate-900">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-6 mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">My Tutors</h1>
                </div>

                {/* Practice Tip: Link this button to your /add-tutor form page */}
                <button onClick={() => redirect('/add-tutor')} className="self-start md:self-auto px-5 py-2.5 bg-slate-900 text-white font-semibold text-sm rounded-xl hover:bg-slate-800 transition shadow-sm">
                    + Add Tutor
                </button>
            </div>

            {/* Grid Layout for published listings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Replace sampleMyTutors.map with your dynamic state when ready to connect your API */}
                {sampleMyTutors.map((tutor) => (
                    <div
                        key={tutor._id}
                        className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                        <div className="p-6">
                            {/* Profile Card Header */}
                            <div className="flex items-start gap-4 mb-4">
                                <img
                                    src={tutor.tutorImage}
                                    alt={tutor.subject}
                                    className="w-16 h-16 rounded-xl object-cover border border-slate-100 bg-slate-50"
                                />
                                <div className="flex-1 min-w-0">
                                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                        {tutor.teachingMethod}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-900 leading-snug tracking-tight mb-0.5">
                                        {tutor.subject}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                        <FaLocationArrow /> {tutor.location}
                                    </p>
                                </div>
                            </div>

                            {/* Bio Section */}
                            <p className="text-slate-600 text-sm leading-relaxed mb-5 line-clamp-3">
                                {tutor.bio}
                            </p>

                            {/* Specifications Sub-Grid */}
                            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center text-xs border border-slate-100">
                                <div>
                                    <p className="text-slate-400 font-medium mb-0.5">Rate</p>
                                    <p className="font-bold text-slate-900">{tutor.hourlyFee} BDT/hr</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 font-medium mb-0.5">Slots Left</p>
                                    <p className="font-bold text-slate-900">{tutor.totalSlot} seats</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 font-medium mb-0.5">Availability</p>
                                    <p className="font-bold text-slate-800 text-[10px] truncate px-1">{tutor.availableTime}</p>
                                </div>
                            </div>
                        </div>

                        {/* Practical Action Footer Bar */}
                        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-4">
                            <button
                                onClick={() => handleDeleteProfile(tutor._id)}
                                className="px-4 py-2 text-xs font-semibold bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-xl border border-transparent hover:border-red-100 transition"
                            >
                                Delete Listing
                            </button>

                            <button
                                onClick={() => handleUpdateProfile(tutor._id)}
                                className="px-5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition shadow-sm"
                            >
                                Modify Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}