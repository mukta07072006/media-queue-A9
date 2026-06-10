// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
// import { FiArrowRight, FiCalendar, FiClock, FiUser } from 'react-icons/fi';
// import { Parkinsans } from 'next/font/google';
// import { API_URL } from '@/lib/api';
// import { Highlight } from './reusablecomp/Highlight';
// import CircularGallery from './ui/circularGallery';


// const parkinsans = Parkinsans({
//   subsets: ['latin'],
//   display: 'swap',
// });

// const AvailableTutors = () => {
//   const [tutors, setTutors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchTutors = async () => {
//       try {
//         const response = await fetch(`${API_URL}/api/tutors/home`);

//         if (!response.ok) {
//           throw new Error('Failed to fetch tutors');
//         }

//         const data = await response.json();
//         setTutors(data);
//       } catch (err) {
//         setError(err.message || 'Something went wrong');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTutors();
//   }, []);

//   return (
//     <section className="bg-green-50 py-24 w-full">
//       <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
//         {/* Header */}
//         <div className="text-center max-w-3xl mx-auto mb-16">
//           <h2
//             className={`${parkinsans.className} text-5xl md:text-6xl font-semibold text-black leading-tight`}
//           >
//             Meet Our Expert
//             <br />
//             <Highlight>Tutors</Highlight>
//           </h2>

//           <p
//             className={`${parkinsans.className} text-lg text-slate-700 mt-5`}
//           >
//             Connect with experienced educators and book personalized learning
//             sessions that help you reach your academic goals faster.
//           </p>
//         </div>

//       <div style={{ height: '600px', position: 'relative' }}>
//   <CircularGallery
//     bend={0}
//     textColor="#ffffff"
//     borderRadius={0.05}
//     scrollEase={0.05}
//     fontUrl={`${parkinsans.className}`}
//     font="bold 30px Orbitron"
//     scrollSpeed={2}
// />
// </div>


        
//       </div>
//     </section>
//   );
// };

// export default AvailableTutors;