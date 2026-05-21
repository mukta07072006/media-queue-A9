'use client';

import { useState, useEffect } from 'react';
import { authClient } from "@/lib/auth-client";



export default function MyBookingsPage() {

    const { data: session, isPending, error } = authClient.useSession();

    const { user } = session || {};
    console.log(user?.id)

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch(`http://localhost:4500/api/bookings/mine?studentId=${user?.id}`)
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
            const res = await fetch(`http://localhost:4500/api/bookings/${bookingId}`,{
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
        <div className="max-w-full min-h-[70vh] min-w-full mx-auto my-10 px-10 text-slate-900">
            {/* Header Panel */}
            <div className="mb-8 border-b border-slate-100 pb-5">
                <h1 className="text-3xl font-extrabold tracking-tight">My Booked Sessions</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Review your reserved scheduling periods, tutor coordinates, and classroom methods.
                </p>
            </div>


            {/* Grid Layout Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Replace sampleBookings.map with your live state variable when fetching is ready */}
                {bookings.map((booking) => (
                    <div
                        key={booking._id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                        <div>
                            {/* Tutor Header Profile Section */}
                            <div className="flex items-start gap-4 mb-4">
                                <img
                                    src={booking.tutorImage}
                                    alt={booking.tutorName}
                                    className="w-14 h-14 rounded-xl object-cover bg-slate-100"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-base font-bold text-slate-900 truncate">{booking.tutorName}</h3>
                                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${booking.status === 'Confirmed'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600 truncate mt-0.5">{booking.subject}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{booking.location}</p>
                                </div>
                            </div>

                            {/* Booking Specifications Info List */}
                            <div className="space-y-2 border-t border-b border-slate-50 py-3 my-3 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-400 font-medium">Teaching Setup:</span>
                                    <span className="text-slate-700 font-semibold">{booking.teachingMethod}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400 font-medium">Reserved Slots:</span>
                                    <span className="text-slate-700 font-semibold">1 Slot</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400 font-medium">Rate Apportionment:</span>
                                    <span className="text-slate-900 font-bold">{booking.hourlyFee} BDT / hr</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400 font-medium">Transaction Date:</span>
                                    <span className="text-slate-500 text-[11px] font-medium truncate max-w-[220px]">
                                        {booking.bookedAt ? new Date(booking.bookedAt).toLocaleString() : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Practical Action Footer Container */}
                        <div className="pt-2 flex gap-3">
                            <button
                                onClick={() => handleBookings(booking._id)}
                                className="flex-1 py-2 border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 font-semibold rounded-xl text-xs transition"
                            >
                                Cancel Booking
                            </button>

                            <button
                                onClick={() => toast.error('Feature not implemented yet. Please check back later!')}
                                className="flex-1 py-2 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-slate-800 transition shadow-sm"
                            >
                                Enter Classroom
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}