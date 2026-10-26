'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Parkinsans } from 'next/font/google';
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    Clock,
    MapPin,
    Video,
    Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import { API_URL } from '@/lib/api';

const parkinsans = Parkinsans({ subsets: ['latin'], display: 'swap' });

function formatDate(value) {
    if (!value) return 'Date pending';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date pending';
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatBookingTime(booking) {
    if (booking.bookedTime) return booking.bookedTime;
    if (!booking.bookedAt) return 'Time pending';

    const date = new Date(booking.bookedAt);
    if (Number.isNaN(date.getTime())) return 'Time pending';
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });
}

function statusStyle(status) {
    switch (status?.toLowerCase()) {
        case 'confirmed':
            return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
        case 'pending':
            return 'bg-amber-50 text-amber-700 ring-amber-200';
        case 'cancelled':
            return 'bg-red-50 text-red-600 ring-red-200';
        default:
            return 'bg-slate-50 text-slate-600 ring-slate-200';
    }
}

export default function MyBookingsPage() {
    const { data: session, isPending } = authClient.useSession();
    const userId = session?.user?.id;
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        if (isPending || !userId) return;

        let isCurrent = true;

        const fetchBookings = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await fetch(
                    `${API_URL}/api/bookings/mine?studentId=${encodeURIComponent(userId)}`
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch your booked sessions.');
                }

                const data = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error('The server returned an invalid bookings response.');
                }

                if (isCurrent) setBookings(data);
            } catch (err) {
                if (isCurrent) {
                    setError(err.message || 'Something went wrong while loading your sessions.');
                }
            } finally {
                if (isCurrent) setLoading(false);
            }
        };

        fetchBookings();
        return () => {
            isCurrent = false;
        };
    }, [isPending, userId, retryCount]);

    const handleBookings = async (bookingId) => {
        setCancellingId(String(bookingId));

        try {
            const response = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ status: 'Cancelled' }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to cancel the booking. Please try again.');
            }

            setBookings((previousBookings) =>
                previousBookings.map((booking) =>
                    String(booking._id) === String(bookingId)
                        ? { ...booking, status: 'Cancelled' }
                        : booking
                )
            );
            toast.success('Session cancelled.');
        } catch (err) {
            toast.error(err.message || 'Failed to cancel the booking. Please try again.');
        } finally {
            setCancellingId('');
        }
    };

    const renderSkeletons = () => (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="animate-pulse rounded-[2rem] bg-white p-2.5 shadow-sm ring-1 ring-green-900/5"
                >
                    <div className="h-32 rounded-3xl bg-green-100" />
                    <div className="space-y-3 px-3 pb-3 pt-11">
                        <div className="mx-auto h-4 w-2/3 rounded-full bg-green-100" />
                        <div className="h-20 rounded-2xl bg-green-50" />
                        <div className="h-11 rounded-2xl bg-green-100" />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <main className={`${parkinsans.className} min-h-screen bg-green-50 py-12`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <section className="relative mb-10 overflow-hidden rounded-3xl bg-green-950 px-8 py-10 text-white md:px-12">
                    <div className="relative z-10 max-w-2xl space-y-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/30 bg-lime-400/20 px-3 py-1 text-xs font-bold text-lime-300">
                            Your Learning
                        </span>
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                            My Booked Sessions
                        </h1>
                        <p className="text-sm leading-relaxed text-green-300 md:text-base">
                            Keep track of your upcoming lessons, tutor details, and session plans all in one place.
                        </p>
                    </div>
                    <div className="pointer-events-none absolute -right-4 -top-10 h-72 w-72 rounded-full bg-lime-400/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-10 right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl" />
                </section>

                {!isPending && userId && !loading && !error && (
                    <p className="mb-6 text-sm font-semibold text-green-600">
                        You have{' '}
                        <span className="text-green-950">{bookings.length}</span>{' '}
                        booked {bookings.length === 1 ? 'session' : 'sessions'}
                    </p>
                )}

                {isPending || (userId && loading) ? (
                    renderSkeletons()
                ) : userId && error ? (
                    <div className="rounded-3xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm">
                        <p className="text-sm font-semibold text-red-700">{error}</p>
                        <button
                            type="button"
                            onClick={() => setRetryCount((count) => count + 1)}
                            className="mt-5 rounded-2xl bg-green-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-900"
                        >
                            Try again
                        </button>
                    </div>
                ) : !userId ? (
                    <div className="rounded-3xl border border-green-100 bg-white px-6 py-14 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-green-100 text-green-700">
                            <BookOpen size={28} />
                        </div>
                        <h2 className="text-xl font-bold text-green-950">Sign in to view your sessions</h2>
                        <p className="mx-auto mt-2 max-w-md text-sm text-green-700">
                            Your bookings will be waiting here once you sign in.
                        </p>
                        <Link
                            href="/login"
                            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-green-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-900"
                        >
                            Sign in <ArrowRight size={15} />
                        </Link>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="rounded-3xl border border-green-100 bg-white px-6 py-14 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-green-100 text-green-700">
                            <CalendarDays size={28} />
                        </div>
                        <h2 className="text-xl font-bold text-green-950">No sessions booked yet</h2>
                        <p className="mx-auto mt-2 max-w-md text-sm text-green-700">
                            Find a tutor and book your first session to get started.
                        </p>
                        <Link
                            href="/tutors"
                            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-green-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-900"
                        >
                            Explore tutors <ArrowRight size={15} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {bookings.map((booking) => {
                            const isCancelled = booking.status?.toLowerCase() === 'cancelled';

                            return (
                                <article
                                    key={booking._id}
                                    className="group flex flex-col rounded-[2rem] bg-white p-2.5 shadow-[0_10px_30px_-12px_rgba(20,83,45,0.25)] ring-1 ring-green-900/5 transition-transform duration-300 hover:-translate-y-1"
                                >
                                    <div className="relative">
                                        <div className="h-32 rounded-3xl bg-[radial-gradient(circle_at_20%_20%,#d9f99d_0%,transparent_48%),radial-gradient(circle_at_85%_15%,#4ade80_0%,transparent_48%),linear-gradient(135deg,#14532d,#064e3b)]" />
                                        <span
                                            className={`absolute left-3 top-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold capitalize ring-1 ${statusStyle(booking.status)}`}
                                        >
                                            {booking.status || 'Pending'}
                                        </span>

                                        <div className="absolute bottom-0 left-4 translate-y-1/2">
                                            {booking.tutorImage ? (
                                                <img
                                                    src={booking.tutorImage}
                                                    alt={booking.tutorName || 'Tutor'}
                                                    className="h-[68px] w-[68px] rounded-full bg-lime-100 object-cover ring-[5px] ring-white"
                                                />
                                            ) : (
                                                <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-lime-100 text-2xl font-bold text-green-800 ring-[5px] ring-white">
                                                    {booking.tutorName?.charAt(0).toUpperCase() || 'T'}
                                                </div>
                                            )}
                                        </div>

                                        <span className="absolute bottom-0 right-3 inline-flex max-w-[58%] translate-y-1/2 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-bold text-green-950 shadow-[0_4px_14px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
                                            <BookOpen size={16} className="shrink-0 text-lime-600" />
                                            <span className="truncate">{booking.subject || 'Learning Session'}</span>
                                        </span>
                                    </div>

                                    <div className="px-3 pt-11">
                                        <h2 className="truncate text-lg font-bold leading-tight text-green-950">
                                            {booking.tutorName || 'Unknown Tutor'}
                                        </h2>
                                        <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-400">
                                            <MapPin size={13} className="shrink-0" />
                                            <span className="truncate">{booking.location || 'Location unavailable'}</span>
                                        </p>
                                    </div>

                                    <div className="mt-5 grid grid-cols-3 gap-2 px-3">
                                        <div className="min-w-0">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                                                <CalendarDays size={11} />
                                            </span>
                                            <p className="mt-2 truncate text-sm font-bold text-green-950">
                                                {formatDate(booking.bookedDate || booking.bookedAt)}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">Session date</p>
                                        </div>
                                        <div className="min-w-0">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-white">
                                                <Clock size={11} />
                                            </span>
                                            <p className="mt-2 truncate text-sm font-bold text-green-950">
                                                {formatBookingTime(booking)}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">Session time</p>
                                        </div>
                                        <div className="min-w-0">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-white">
                                                <Wallet size={11} />
                                            </span>
                                            <p className="mt-2 truncate text-sm font-bold text-green-950">
                                                ৳{booking.hourlyFee || 0}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">per hour</p>
                                        </div>
                                    </div>

                                    <div className="mx-3 mt-4 flex items-center justify-between gap-2 rounded-2xl border border-green-100 bg-green-50 px-3 py-2.5">
                                        <span className="text-xs font-semibold text-green-700">Teaching setup</span>
                                        <span className="truncate text-right text-xs font-bold text-green-950">
                                            {booking.teachingMethod || 'Not specified'}
                                        </span>
                                    </div>

                                    {booking.bookedAt && (
                                        <p className="mx-3 mt-3 text-xs text-slate-400">
                                            Booked {formatDate(booking.bookedAt)}
                                        </p>
                                    )}

                                    <div className="mt-auto grid grid-cols-2 gap-3 px-3 pt-5">
                                        <button
                                            type="button"
                                            onClick={() => handleBookings(booking._id)}
                                            disabled={isCancelled || cancellingId === String(booking._id)}
                                            className="w-full rounded-2xl border border-green-100 bg-white py-3 text-sm font-bold text-green-950 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {cancellingId === String(booking._id)
                                                ? 'Cancelling...'
                                                : isCancelled
                                                  ? 'Cancelled'
                                                  : 'Cancel session'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toast.error('Class access is not available yet. Please check back later.')}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-950 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-900"
                                        >
                                            <Video size={15} />
                                            Enter class
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
