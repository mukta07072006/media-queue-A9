'use client'
import React from 'react';
import CardSwap, {Card} from './CardSwap';
import { Highlight } from './reusablecomp/Highlight';
import { Parkinsans } from 'next/font/google';
import { CalendarDays, LockKeyhole, ShieldCheck } from 'lucide-react';


export const parkinsans = Parkinsans({
  subsets: ['latin'],
  display: 'swap',
});


const Features = () => {
    return (
      <>
        <div className='bg-green-50 max-w-7xl grid grid-cols-1 lg:grid-cols-2 px-4 lg:px-20 py-24 gap-8 w-full pb-10 h-fit relative mt-6 mb-5 lg:mb-10 lg:mt-30'>


         <div>
            <h1 className={`${parkinsans.className} text-black w-full text-center lg:text-start text-5xl mt-6 md:text-5xl font-semibold `}>
                        Everything You Need
                        <Highlight>to Learn</Highlight>  
                       & Teach
                    </h1>
                    <p className={`text-black text-center lg:text-start text-lg mt-6 max-w-md md:max-w-xl ${parkinsans.className}`}>
                        Connect with <span className='text-green-700 font-bold'>  verified tutors</span>
                            , book sessions instantly, and manage your learning journey through one secure platform.
                    </p>
         </div>


            <div className='hidden lg:block'>
              <CardSwap
    cardDistance={50}
    verticalDistance={70}
    delay={5000}
    pauseOnHover={false}
  >
    <Card>
      <h1 className={`${parkinsans.className} text-lime-100 text-4xl mt-6 md:text-5xl font-semibold `}>
                    
                        <Highlight>Verified</Highlight>  
                       Tutors Profile<ShieldCheck
                       size={48}

                       />
                    </h1>
      <p className={`${parkinsans.className} text-lime-100 text-xl mt-4 `}>Learn from trusted educators</p>
      <p className={`${parkinsans.className} text-lime-200 text-sm max-w-xl mt-6 `}>Every tutor goes through a verification process before joining the platform. Students can review qualifications, expertise, experience, ratings, and teaching subjects before booking.</p>
    </Card>
    <Card>
      <h1 className={`${parkinsans.className} text-lime-100 text-4xl mt-6 md:text-5xl font-semibold `}>
                    
                        <Highlight>Smart</Highlight>  
                       Booking & Availability<CalendarDays
                       size={48}
                       
                       />
                    </h1>
      <p className={`${parkinsans.className} text-lime-100 text-xl mt-4 `}>Book sessions in seconds</p>
      <p className={`${parkinsans.className} text-lime-200 text-sm max-w-xl mt-6 `}>Students can browse available time slots, schedule lessons instantly, and manage upcoming sessions from a personalized dashboard without back-and-forth communication.</p>
    </Card>
    <Card>
      <h1 className={`${parkinsans.className} text-lime-100 text-4xl mt-6 md:text-5xl font-semibold `}>
                    
                        <Highlight>Secure</Highlight>  
                      Learning Ecosystem<LockKeyhole
                       size={48}
                       
                       />
                    </h1>
      <p className={`${parkinsans.className} text-lime-100 text-xl mt-4 `}>Learn from trusted educators</p>
      <p className={`${parkinsans.className} text-lime-200 text-sm max-w-xl mt-6 `}>Identity verification, booking protection, session tracking, and review systems help create a trustworthy environment for both students and tutors.</p>
    </Card>
  </CardSwap>
            </div>




        </div>

        
          <div className='block lg:hidden'>

            <div className='h-6xl w-100 rounded-xl p-6 border-4 border-lime-200 bg-emerald-800'>
                   <h1 className={`${parkinsans.className} text-lime-100 text-4xl mt-6 md:text-5xl font-semibold `}>
                    
                        <Highlight>Verified</Highlight>  
                       Tutors Profile<ShieldCheck
                       size={48}

                       />
                    </h1>
      <p className={`${parkinsans.className} text-lime-100 text-xl mt-4 `}>Learn from trusted educators</p>
      <p className={`${parkinsans.className} text-lime-200 text-sm max-w-xl mt-6 `}>Every tutor goes through a verification process before joining the platform. Students can review qualifications, expertise, experience, ratings, and teaching subjects before booking.</p>

              </div>

              <div className='h-6xl w-100 rounded-xl p-6 border-4 border-lime-200 bg-emerald-800'>
                  <h1 className={`${parkinsans.className} text-lime-100 text-4xl mt-6 md:text-5xl font-semibold `}>
                    
                        <Highlight>Smart</Highlight>  
                       Booking & Availability<CalendarDays
                       size={48}
                       
                       />
                    </h1>
      <p className={`${parkinsans.className} text-lime-100 text-xl mt-4 `}>Book sessions in seconds</p>
      <p className={`${parkinsans.className} text-lime-200 text-sm max-w-xl mt-6 `}>Students can browse available time slots, schedule lessons instantly, and manage upcoming sessions from a personalized dashboard without back-and-forth communication.</p>

              </div>

              <div className='h-6xl w-100 rounded-xl p-6 border-4 border-lime-200 bg-emerald-800'>
                      <h1 className={`${parkinsans.className} text-lime-100 text-4xl mt-6 md:text-5xl font-semibold `}>
                    
                        <Highlight>Secure</Highlight>  
                      Learning Ecosystem<LockKeyhole
                       size={48}
                       
                       />
                    </h1>
      <p className={`${parkinsans.className} text-lime-100 text-xl mt-4 `}>Learn from trusted educators</p>
      <p className={`${parkinsans.className} text-lime-200 text-sm max-w-xl mt-6 `}>Identity verification, booking protection, session tracking, and review systems help create a trustworthy environment for both students and tutors.</p>
              </div>
              


          </div>
        </>
    );
};

export default Features;