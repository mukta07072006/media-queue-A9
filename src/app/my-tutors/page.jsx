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


     

    return (
        <div className="min-w-full mx-auto my-12 px-20 text-slate-900">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Replace sampleMyTutors.map with your dynamic state when ready to connect your API */}
                {myTutors.map((tutor) => (
                    console.log("tutorId", tutor._id),
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
                                onClick={() => handleUpdateProfile(tutor)}
                                className="px-5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition shadow-sm"
                            >
                                Modify Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>


            {/* Modify Details Inline Modal */}
{editingTutor && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Modify Listing details</h2>
                <button onClick={() => setEditingTutor(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const payload = Object.fromEntries(formData.entries());

                try {
                    const response = await fetch(`http://localhost:4500/api/tutors/mine?tutorId=${editingTutor._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        handleUpdateSuccess(data); // Inject changes into frontend view
                        toast.success('Listing modified successfully!');
                        setEditingTutor(null); // Close modal
                    } else {
                        toast.error(data.error || 'Failed to apply edits');
                    }
                } catch (err) {
                    toast.error('Network mistake syncing updates');
                }
            }} className="p-6 overflow-y-auto space-y-4 text-sm">
                
                <div>
                    <label className="block font-bold text-slate-700 mb-1 text-xs uppercase">Subject</label>
                    <input type="text" name="subject" defaultValue={editingTutor.subject} required className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block font-bold text-slate-700 mb-1 text-xs uppercase">Hourly Fee (BDT)</label>
                        <input type="number" name="hourlyFee" defaultValue={editingTutor.hourlyFee} required className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900" />
                    </div>
                    <div>
                        <label className="block font-bold text-slate-700 mb-1 text-xs uppercase">Total Seats</label>
                        <input type="number" name="totalSlot" defaultValue={editingTutor.totalSlot} required className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900" />
                    </div>
                </div>

                <div>
                    <label className="block font-bold text-slate-700 mb-1 text-xs uppercase">Location</label>
                    <input type="text" name="location" defaultValue={editingTutor.location} required className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>

                <div>
                    <label className="block font-bold text-slate-700 mb-1 text-xs uppercase">Availability Window</label>
                    <input type="text" name="availableTime" defaultValue={editingTutor.availableTime}  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>

                <div>
                    <label className="block font-bold text-slate-700 mb-1 text-xs uppercase">Bio Summary</label>
                    <textarea name="bio" rows="3" defaultValue={editingTutor.bio}  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none" />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <button type="button" onClick={() => setEditingTutor(null)} className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancel</button>
                    <button type="submit" className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition">Save updates</button>
                </div>
            </form>
        </div>
    </div>
)}

            {/* Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm mx-4">
                        <h2 className="text-lg font-bold text-slate-900 mb-2">Delete Listing?</h2>
                        <p className="text-slate-600 text-sm mb-6">
                            Are you sure you want to delete the <strong>{deleteModal.tutorSubject}</strong> listing? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}