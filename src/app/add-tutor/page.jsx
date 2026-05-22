'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from "@/lib/auth-client"; // Adjust path to your auth client
import toast from 'react-hot-toast';

export default function AddTutorPage() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    // Form State initialized with empty fields matching your exact database keys
    const [formData, setFormData] = useState({
        subject: '',
        tutorImage: '',
        tutorName: '',
        tutorEmail: '',
        bio: '',
        location: '',
        teachingMethod: 'Online Live Classes',
        hourlyFee: '',
        availableTime: '',
        totalSlot: '',
        sessionStartDate: '',
        sessionEndDate: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!session?.user) {
            setError('You must be logged in to add a tutor profile.');
            return;
        }

        const {data:tokenData} =await authClient.token();
        console.log(tokenData.token)

        setLoading(true);
        setError('');

        // Prepare payload parsing numerical inputs and formatting standard dates
        const payload = {
            tutorName: formData.tutorName,
            tutorEmail: formData.tutorEmail,
            authorId: session?.user?.id,
            authorName: session?.user?.name,
            authorEmail: session?.user?.email,
            subject: formData.subject,
            tutorImage: formData.tutorImage || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
            bio: formData.bio,
            location: formData.location,
            teachingMethod: formData.teachingMethod,
            hourlyFee: parseInt(formData.hourlyFee, 10) || 0,
            availableTime: formData.availableTime,
            totalSlot: parseInt(formData.totalSlot, 10) || 0,
            sessionStartDate: formData.sessionStartDate ? new Date(formData.sessionStartDate).toString() : '',
            sessionEndDate: formData.sessionEndDate ? new Date(formData.sessionEndDate).toString() : ''
        };

        try {

            const response = await fetch('http://localhost:4500/api/tutors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${tokenData.token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                toast.error('Failed to create tutor profile. Please try again.');
                throw new Error(`Server responded with status ${response.status}`);
            }

            toast.success('Tutor profile created successfully!');
            router.push('/tutors');
        } catch (err) {
            setError(err.message || 'An error occurred while transmitting data.');
        } finally {
            setLoading(false);
        }
    };

    if (isPending) {
        return <div className="text-center py-20 text-slate-500 font-medium">Verifying Status...</div>;
    }

    if (!session) {
        return (
            <div className="text-center py-20 text-red-500 font-medium">
                <p>Access Denied. Please log in to your account first.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto my-10 p-8 bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-sm">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">Become a Tutor</h2>
            <p className="text-slate-500 text-sm mb-6">Create a teaching slot profile. Your profile will be linked to your logged-in user identity.</p>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Read-Only Auto-fills from BetterAuth */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Tutor Name</label>
                        <input value={formData.tutorName} onChange={handleChange} required name="tutorName" placeholder={session?.user?.name} type="text" className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none rounded-xl text-sm transition" />
                    </div>
                    <div>
                        <label className=" block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Tutor Email </label>
                        <input value={formData.tutorEmail} onChange={handleChange} required name="tutorEmail" placeholder={session?.user?.email} type="text" className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none rounded-xl text-sm transition" />
                    </div>
                </div>

                {/* Subject & Image */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Subject / Skill Area</label>
                        <input type="text" name="subject" required value={formData.subject} onChange={handleChange} placeholder="e.g., Web Development (React & Next.js)" className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none rounded-xl text-sm transition" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Profile Image URL</label>
                        <input type="url" name="tutorImage" value={formData.tutorImage} onChange={handleChange} placeholder="https://images.unsplash.com/... (optional)" className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none rounded-xl text-sm transition" />
                    </div>
                </div>

                {/* Bio */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Professional Bio</label>
                    <textarea name="bio" rows="3" required value={formData.bio} onChange={handleChange} placeholder="Briefly describe your experience, frameworks, or targeted teaching styles..." className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none rounded-xl text-sm transition resize-none"></textarea>
                </div>

                {/* Location & Teaching Method */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Location (City / District Area)</label>
                        <input type="text" name="location" required value={formData.location} onChange={handleChange} placeholder="e.g., Chittagong (GEC Circle, Chattogram)" className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none rounded-xl text-sm transition" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Teaching Method</label>
                        <select name="teachingMethod" value={formData.teachingMethod} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-slate-400 outline-none rounded-xl text-sm transition text-slate-800 font-medium">
                            <option value="Online Live Classes">Online Live Classes</option>
                            <option value="Offline (In-Person)">Offline (In-Person)</option>
                            <option value="Online & Offline (Hybrid)">Online & Offline (Hybrid)</option>
                        </select>
                    </div>
                </div>

                {/* Hourly Fee, Capacity, and General Time Strings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Hourly Fee (BDT)</label>
                        <input type="number" name="hourlyFee" required min="0" value={formData.hourlyFee} onChange={handleChange} placeholder="500" className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none rounded-xl text-sm transition" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Total Slots Available</label>
                        <input type="number" name="totalSlot" required min="1" value={formData.totalSlot} onChange={handleChange} placeholder="5" className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none rounded-xl text-sm transition" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">General Available Hours</label>
                        <input type="text" name="availableTime" required value={formData.availableTime} onChange={handleChange} placeholder="e.g., 09:00 AM - 05:00 PM" className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none rounded-xl text-sm transition" />
                    </div>
                </div>

                {/* Precise Booking Calendar Window Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Session Window Start Date/Time</label>
                        <p className="text-[11px] text-slate-400 mb-2">When does this specific scheduling window open?</p>
                        <input type="datetime-local" name="sessionStartDate" required value={formData.sessionStartDate} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-slate-400 outline-none rounded-xl text-sm transition text-slate-700" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Session Window End Date/Time</label>
                        <p className="text-[11px] text-slate-400 mb-2">When does this registration batch expire?</p>
                        <input type="datetime-local" name="sessionEndDate" required value={formData.sessionEndDate} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-slate-400 outline-none rounded-xl text-sm transition text-slate-700" />
                    </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4">
                    <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 rounded-xl shadow-lg shadow-sky-200/80 hover:shadow-xl transition-all duration-200 active:scale-[0.98]">
                        {loading ? 'Publishing Profile...' : 'Submit Tutor Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
}