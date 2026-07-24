'use client'
import { SidebarNav } from '@/components/reusablecomp/dashboardsidebar';
import React from 'react';
import { Parkinsans } from 'next/font/google';

const parkinsans = Parkinsans({ subsets: ['latin'], display: 'swap' });

const dashboard = () => {
    return (
        <div  className={`${parkinsans.className} min-h-screen flex max-w-7xl px-4 sm:px-6 lg:px-8`}>
           <div>
            <SidebarNav/>
            
           </div>
           <div>
             Hello from teacher dashboard
           </div>
        </div>
    );
};

export default dashboard;