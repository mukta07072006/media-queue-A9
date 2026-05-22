'use client';
import { useState, useEffect } from 'react';
import { authClient } from "@/lib/auth-client";
import { redirect } from 'next/navigation';
import { FaLocationArrow } from 'react-icons/fa';
import toast from 'react-hot-toast';



export default function MyTutorsPage() {


    const { data: session, isPending, error } = authClient.useSession();

    const { user } = session || {};
    console.log(user?.id)


    const [myTutors, setMyTutors] = useState([]);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, tutorId: null, tutorSubject: '' });
    const [editingTutor, setEditingTutor] = useState(null);


    useEffect(() => {
        const myTutorsData = async() => {


            if (!user?.id) return;
        try{
            const response = await fetch(`http://localhost:4500/api/tutors/mine?userId=${user?.id}`);
            const data = await response.json();
            setMyTutors(data);
            console.log(myTutors)
        }
        catch(error){
            toast.error('Error fetching my tutors:', error);
        }
    }
    console.log(myTutors)
    myTutorsData();
}, [user?.id]);  


    console.log(myTutors._id)


    const deleteTutor = async (tutorId) => {
        try{
            const response = await fetch(`http://localhost:4500/api/tutors/mine?tutorId=${tutorId}`,{
                method: 'DELETE'
            })
            const data = await response.json();
            if (response.ok) {
            setMyTutors((prevTutors) => {
                return prevTutors.filter(tutor => {
                    return String(tutor._id) !== String(tutorId);
                });
            });

            toast.success('Tutor deleted successfully!');
            setDeleteModal({ isOpen: false, tutorId: null, tutorSubject: '' });
        } else {
            toast.error('Failed to delete tutor: ' + (data.message || 'Unknown error'));
        }

        }
        catch(error){
            toast.error('Error deleting tutor:', error);
        }
    }


    // Practice targets: Write functions to handle updates and deletions


    const handleDeleteProfile = (tutorId, tutorSubject) => {
        setDeleteModal({ isOpen: true, tutorId, tutorSubject });
    };

    const handleConfirmDelete = () => {
        if (deleteModal.tutorId) {
            deleteTutor(deleteModal.tutorId);
        }
    };

    const handleCancelDelete = () => {
        setDeleteModal({ isOpen: false, tutorId: null, tutorSubject: '' });
    };



    if (myTutors.length === 0) return (
        <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
            <p className="text-slate-500 font-medium">You haven't added any tutors yet.</p>
        </div>
     );
    


 


const handleUpdateProfile = (tutor) => {
    console.log("from update " , tutor)
    setEditingTutor(tutor); 
};

const handleUpdateSuccess = (updatedTutor) => {
    setMyTutors((prevTutors) =>
        prevTutors.map((tutor) =>
           
            String(tutor._id) === String(updatedTutor._id) ? updatedTutor : tutor
        )
    );
};

console.log(myTutors)
     

    return (
        <div className="w-full min-h-screen bg-slate-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    My Tutors
                </h1>

                <p className="text-sm text-slate-500 mt-2">
                    Manage your published tutor listings and availability.
                </p>
            </div>

            <button
                onClick={() => redirect('/add-tutor')}
                className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all duration-200 shadow-sm active:scale-[0.98]"
            >
                + Add Tutor
            </button>
        </div>

        {/* Empty State */}
        {myTutors.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800">
                    No tutor listings found
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                    Create your first tutor listing to start receiving bookings.
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {myTutors.map((tutor) => (
                    <div
                        key={tutor._id}
                        className="group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                    >
                        {/* Card Body */}
                        <div className="p-6 flex-1">

                            {/* Tutor Header */}
                            <div className="flex items-start gap-4">
                                <img
                                    src={
                                        tutor?.tutorImage ||
                                        "https://i.ibb.co/4pDNDk1/avatar.png"
                                    }
                                    alt={tutor?.subject || "Tutor"}
                                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                                />

                                <div className="flex-1 min-w-0">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 mb-2">
                                        {tutor?.teachingMethod || "Teaching"}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-slate-900 leading-tight truncate">
                                        {tutor?.tutorName || "Untitled Tutor"}
                                    </h3>
                                    <h3 className="text-sm bg-gray-50 badge border-none  text-gray-500 leading-tight truncate">
                                        {tutor?.subject || "Untitled Subject"}
                                    </h3>
                                    </div>

                                    {/* <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <FaLocationArrow className="text-xs shrink-0" />

                                        <span className="truncate">
                                            {tutor?.location || "Unknown Location"}
                                        </span>
                                    </div> */}
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="mt-1">
                                <p className="text-sm leading-7 text-slate-600 line-clamp-3">
                                    {tutor?.bio || "No description available."}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="mt-1 grid grid-cols-3 gap-3">
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                                        Rate
                                    </p>

                                    <p className="text-sm font-bold text-slate-900 mt-1 break-words">
                                        {tutor?.hourlyFee || 0} BDT
                                    </p>
                                </div>

                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                                        Seats
                                    </p>

                                    <p className="text-sm font-bold text-slate-900 mt-1">
                                        {tutor?.totalSlot || 0}
                                    </p>
                                </div>

                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                                        Available
                                    </p>

                                    <p className="text-[11px] font-bold text-slate-800 mt-1 line-clamp-2">
                                        {tutor?.availableTime || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-slate-100 bg-slate-50/70 grid grid-cols-2 gap-3">

                            <button
                                onClick={() => handleDeleteProfile(tutor._id)}
                                className="w-full py-3 rounded-2xl border border-red-100 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-all duration-200 active:scale-[0.98]"
                            >
                                Delete
                            </button>

                            <button
                                onClick={() => handleUpdateProfile(tutor)}
                                className="w-full py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-100 transition-all duration-200 active:scale-[0.98]"
                            >
                                Modify
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Edit Modal */}
        {editingTutor && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center text-slate-800 justify-center p-4">
                <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

                    {/* Modal Header */}
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Modify Tutor Listing
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Update your tutor profile information.
                            </p>
                        </div>

                        <button
                            onClick={() => setEditingTutor(null)}
                            className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition flex items-center justify-center"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();

                            
                            const formData = new FormData(e.currentTarget);
                            const payload = Object.fromEntries(formData.entries());
                            const {data: tokenData} =await authClient.token();


                            try {
                                const response = await fetch(
                                    `http://localhost:4500/api/tutors/mine?tutorId=${editingTutor._id}`,
                                    {
                                        method: "PUT",
                                        headers: {
                                            "Content-Type": "application/json",
                                            authorization: `Bearer ${tokenData.token}`,
                                        },
                                        body: JSON.stringify(payload),
                                    }
                                );

                                const data = await response.json();

                                if (response.ok) {
                                    handleUpdateSuccess(data);
                                    toast.success("Listing modified successfully!");
                                    setEditingTutor(null);
                                } else {
                                    toast.error(
                                        data.error || "Failed to apply edits"
                                    );
                                }
                            } catch (err) {
                                toast.error(
                                    "Network mistake syncing updates"
                                );
                            }
                        }}
                        className="overflow-y-auto p-6 space-y-5"
                    >

                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Subject
                            </label>

                            <input
                                type="text"
                                name="subject"
                                defaultValue={editingTutor.subject}
                                required
                                className="w-full h-12 px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                            />
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Hourly Fee
                                </label>

                                <input
                                    type="number"
                                    name="hourlyFee"
                                    defaultValue={editingTutor.hourlyFee}
                                    required
                                    className="w-full h-12 px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Total Seats
                                </label>

                                <input
                                    type="number"
                                    name="totalSlot"
                                    defaultValue={editingTutor.totalSlot}
                                    required
                                    className="w-full h-12 px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Location
                            </label>

                            <input
                                type="text"
                                name="location"
                                defaultValue={editingTutor.location}
                                required
                                className="w-full h-12 px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                            />
                        </div>

                        {/* Availability */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Availability Window
                            </label>

                            <input
                                type="text"
                                name="availableTime"
                                defaultValue={editingTutor.availableTime}
                                className="w-full h-12 px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Bio Summary
                            </label>

                            <textarea
                                name="bio"
                                rows="4"
                                defaultValue={editingTutor.bio}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setEditingTutor(null)}
                                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition shadow-sm"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Delete Modal */}
        {deleteModal.isOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 text-xl shrink-0">
                            ⚠
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Delete Listing?
                            </h2>

                            <p className="text-sm text-slate-500 mt-2 leading-6">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-slate-700">
                                    {deleteModal.tutorSubject}
                                </span>
                                ? This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-8">
                        <button
                            onClick={handleCancelDelete}
                            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleConfirmDelete}
                            className="w-full py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold transition"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
</div>
    );
}