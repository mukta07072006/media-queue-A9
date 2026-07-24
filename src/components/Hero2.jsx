'use client'
import React from 'react';
import { Parkinsans } from 'next/font/google';
import { Highlight } from './reusablecomp/Highlight';
import { AvatarCircles } from './ui/avatar-circles';
import Image from 'next/image';
import photo1 from '@/assets/teacher-one.webp'
import photo2 from '@/assets/teacher-two.webp'
import photo3 from '@/assets/teacher-three.webp'
import { ArrowRight } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { redirect } from 'next/navigation';




export const parkinsans = Parkinsans({
  subsets: ['latin'],
  display: 'swap',
});



const avatars = [
  {
    imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=400&fit=crop&q=80",
    profileUrl: "https://example.com/profile/young-explorer",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=400&h=400&fit=crop&q=80",
    profileUrl: "https://example.com/profile/teen-dev",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop&q=80",
    profileUrl: "https://example.com/profile/creative-kid",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=400&h=400&fit=crop&q=80",
    profileUrl: "https://example.com/profile/skater-boy",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1531303435785-3853ba035cda?w=400&h=400&fit=crop&q=80",
    profileUrl: "https://example.com/profile/future-leader",
  },
];

const HeroNew = () => {


    const {data: session, isPending} = authClient.useSession();

const checkAuth = ()=>{
    if(session){
      redirect('/become-tutor')
    }
    else{
      redirect('/register')
    }
}


    return (
        <div className="bg-green-50 min-h-screen w-full flex justify-center flex-col items-center
        ">
            
           
            <div className='px-5 flex items-center flex-col justify-center'>
                <h1 className={`${parkinsans.className} text-black text-5xl mt-6 md:text-8xl font-semibold text-center`}>
                Find Your Perfect <br />
                <Highlight>Tutor</Highlight>  
               Today
            </h1>
            <p className={`text-black text-lg mt-6 text-center max-w-md md:max-w-xl ${parkinsans.className}`}>
                Join <span className='text-green-700 font-bold'> 10,000+ </span>
                     students connecting with expert tutors and achieving their learning goals faster.
            </p>
            </div>
        <AvatarCircles
            numPeople={99}
            avatarUrls={avatars}
            className={`mt-10 ${parkinsans.className}`}
            />

            <div className='mt-10 max-w-[90vw] md:max-w-full flex gap-5'>
            <button onClick={()=>redirect("/tutors")} className={`px-5 justify-between py-2 items-center cursor-pointer bg-emerald-600 flex gap-8 hover:gap-10 transition-all text-white font-semibold rounded-full ${parkinsans.className}`}>Book a Tutor <div
            className='h-8 w-8 bg-lime-300 rounded-full flex justify-center items-center p-2'>
                <ArrowRight
            size={25}
            color='#000' 
            />
                </div> </button>
            <button onClick={()=> checkAuth()} className={`px-5 justify-between py-2 items-center cursor-pointer bg-white flex hover:gap-10 transition-all gap-8 text-black font-semibold rounded-full ${parkinsans.className}`}>Be a Tutor <div
            className='h-8 w-8 bg-emerald-600 rounded-full flex justify-center items-center p-2'>
                <ArrowRight
            size={25}
            color='#fff' 
            />
                </div> </button>
        </div>

             <div className="grid mt-10 px-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 bg-lime-500 p-3 rounded-xl shadow-[6px_6px_0px_rgb(5_46_22)]">
                <div
      
      className="relative w-full md:w-80 h-64 overflow-hidden rounded-t-xl md:rounded-l-xl xl:rounded-t-none border-2 border-lime-50"
    >
      <Image
        src={photo1}
        alt="Teacher teaching student"
        fill
        className="object-cover"
      />
    </div>
     <div
      
      className="relative w-80 md:w-80 h-64 rounded-b-xl md:rounded-r-xl xl:rounded-none xl:rounded-b-none overflow-hidden border-2 border-lime-50"
    >
      <Image
        src={photo2}
        alt="Teacher teaching student"
        fill
        className="object-cover"
      />
    </div>


        

     <div
      
      className="relative w-80 h-64 overflow-hidden border-2 rounded-r-xl hidden xl:block  border-lime-50"
    >
      <Image
        src={photo3}
        alt="Teacher teaching student"
        fill
        className="object-cover"
      />
    </div>
             </div>


        
          

        </div>
    );
};

export default HeroNew;