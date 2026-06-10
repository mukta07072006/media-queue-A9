'use client'

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import React, { useState } from 'react';

const page = () => {

    const [click , setClick] = useState(true)


    const handleClick = ()=>{
        setClick(!click)
    }

    const timeline = gsap.timeline({
        repeat: -1,
        repeatDelay: 1,
        yoyo: true,
    });

    useGSAP(()=>{
        timeline.to('#box',{
            scale: 20,
            duration: 1,
            ease: 'back.inOut',
            
        })
    }, [])

    useGSAP(()=>{
        gsap.to('#r',{
            repeat: -1,
            repeatDelay: 1,
            yoyo: true,
            duration: 1,
            scale: 2,
            width: 2,
            rotate: 45,
            ease: 'back.inOut',
        }),
        gsap.to('#l',{
            repeat: -1,
            repeatDelay: 1,
            yoyo: true,
            duration: 1,
            scale: 2,
            width: 2,
            rotate: 135,
            ease: 'back.inOut',
        })
    }, [])

    // useGSAP(()=>{
    //     timeline.to('#box',{
    //         x: 200,
    //         duration: 1,
    //         borderRadius: '100%',
    //         ease: 'back.inOut',
    //     }), 

    //     timeline.to('#box',{
    //         scale: 1.5,
    //         duration: 1,
    //         ease: 'back.inOut',
    //     }),


    //     timeline.to('#box',{
    //         x: 400,
    //         duration: 1,
    //         scale: 1,
    //         borderRadius: '8px',
    //         ease: 'back.inOut',
    //     })
    // })

    // useGSAP(()=>{
    //     gsap.fromTo('#box',
    //         {
    //             x: 0,
    //             y: 0,
    //             borderRadius: '0%',
    //             backgroundColor: 'red',
    //         }, {
    //         x: 200,
    //         repeat: -1,
    //         yoyo:true,
    //         borderRadius: '100%',
    //         backgroundColor: 'orange',
    //         duration: 1,
    //         ease: 'bounce.out',
    //     })
    // })


    return (
        <div className='w-screen h-screen flex flex-col items-center justify-center'>
        {
            click ? <div className='w-screen h-[50vh] flex items-center justify-center'>
            
                <div id='cros'>
                    <div id='r' className='absolute w-0 z-5 h-5 rotate-45 self-center bg-white'></div>
            <div id='l' className='absolute w-0 z-5 h-5 -rotate-45  self-center bg-white'></div>
                </div>
     
            <div id="box" className='absolute w-1 h-1 z-2 rounded-[8px] bg-red-500'>
                

            </div>

                    
        </div> : null
        }
        <button className='btn btn-error mt-48' onClick={handleClick}> click me</button>   
        </div>
    );
};

export default page;