'use client';

import { useState, useEffect } from 'react';
import { authClient } from "@/lib/auth-client";
import { API_URL } from '@/lib/api';



export default function MyBookingsPage() {

    const { data: session, isPending, error } = authClient.useSession();

    const { user } = session || {};
    console.log(user?.id)

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch(`${API_URL}/api/bookings/mine?studentId=${user?.id}`)
                if (!res.ok) {
                    throw new Error('Failed to fetch bookings from the server.');
                }
                const data = await res.json();
                setBookings(data);
            }
            catch (err) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }

        }
        fetchBookings();
    }, [user?.id])

    console.log(bookings)
    

    
    const handleBookings = async (bookingId)=>{
        try{
            const res = await fetch(`${API_URL}/api/bookings/${bookingId}`,{
                method: 'PUT',
                headers:{
                    'content-type': 'application/json'
                },
                body: JSON.stringify({status: 'Cancelled'})
            })
            const data = await res.json();
            if(res.ok){
                setBookings((prevBookings) =>
                    prevBookings.map((booking) =>
                        String(booking._id) === String(bookingId) ? { ...booking, status: 'Cancelled' } : booking
                    )
                );
            }
            if(!res.ok){
                throw new Error(data.message || 'Failed to cancel the booking. Please try again later.')
            }
        }
        catch(err){
            toast.error('Failed to cancel the booking. Please try again later.')
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!bookings.length) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-500 font-medium">You didn't book any sessions yet.</p>
    </div>
  );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-8 min-h-screen">
    {/* Header */}
    <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            My Booked Sessions
        </h1>

        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
            Review your reserved scheduling periods, tutor details, and classroom methods.
        </p>
    </div>

    {/* Empty State */}
    {bookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
                No bookings found
            </h2>

            <p className="text-sm text-slate-500 mt-2">
                Your booked sessions will appear here.
            </p>
        </div>
    ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookings.map((booking) => (
                <div
                    key={booking._id}
                    className="group bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                    {/* Top Content */}
                    <div>
                        {/* Tutor Info */}
                        <div className="flex items-start gap-4">
                            <img
                                src={
                                    booking?.tutorImage ||
                                    "https://i.ibb.co/4pDNDk1/avatar.png"
                                }
                                alt={booking?.tutorName || "Tutor"}
                                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <h3 className="text-base font-bold text-slate-900 truncate">
                                            {booking?.tutorName || "Unknown Tutor"}
                                        </h3>

                                        <p className="text-sm text-slate-600 truncate mt-1">
                                            {booking?.subject || "No Subject"}
                                        </p>
                                    </div>

                                    <span
                                        className={`shrink-0 text-[11px] font-semibold px-3 py-1 rounded-full border ${
                                            booking?.status === "Confirmed"
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                : booking?.status === "Pending"
                                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                                : "bg-red-50 text-red-700 border-red-100"
                                        }`}
                                    >
                                        {booking?.status || "Pending"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>

                                    <span className="truncate">
                                        {booking?.location || "Location unavailable"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="mt-5 space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-slate-500">
                                    Teaching Setup
                                </span>

                                <span className="text-sm font-semibold text-slate-800 text-right">
                                    {booking?.teachingMethod || "N/A"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-slate-500">
                                    Reserved Slots
                                </span>

                                <span className="text-sm font-semibold text-slate-800">
                                    1 Slot
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-slate-500">
                                    Hourly Rate
                                </span>

                                <span className="text-sm font-bold text-slate-900">
                                    {booking?.hourlyFee || 0} BDT/hr
                                </span>
                            </div>

                            <div className="flex items-start justify-between gap-3">
                                <span className="text-sm text-slate-500 shrink-0">
                                    Transaction Date
                                </span>

                                <span className="text-xs text-slate-600 text-right break-words">
                                    {booking?.bookedAt
                                        ? new Date(
                                              booking.bookedAt
                                          ).toLocaleString()
                                        : "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <button
                            onClick={() => handleBookings(booking._id)}
                            className="w-full py-3 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-200 active:scale-[0.98]"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={() =>
                                toast.error(
                                    "Feature not implemented yet. Please check back later!"
                                )
                            }
                            className="w-full py-3 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all duration-200 active:scale-[0.98] shadow-sm"
                        >
                            Enter Class
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )}
</div>
    );
}