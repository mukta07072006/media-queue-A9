'use client';

import React from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import { FiArrowRight, FiBookOpen, FiSearch, FiStar } from 'react-icons/fi';

import 'swiper/css';
import 'swiper/css/effect-fade';

const slides = [
  {
    id: 1,
    tag: "🚀 Learn on Your Schedule",
    title: "Find the Perfect Tutor for Your Learning Journey",
    description: "Connect with certified industry professionals and expert academics for hyper-personalized 1-on-1 live interactive learning sessions.",
    ctaText: "Explore Tutors",
    ctaLink: "/tutors",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    tag: "🏆 Master New Skills",
    title: "Unlock Excellence With Top-Tier Mentorship",
    description: "From advanced web development tools like React and Next.js to complex calculus, bridge your knowledge gaps efficiently.",
    ctaText: "Get Started Now",
    ctaLink: "/signup",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    tag: "💼 Teach & Earn Globally",
    title: "Share Your Knowledge. Inspire the Next Generation.",
    description: "Become an active part of our global educator network. Set your own flexible hours, design your curriculum, and monetize your expertise.",
    ctaText: "Join as a Tutor",
    ctaLink: "/signup?role=tutor",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  },
];

const Hero = () => {
  return (
    <div className="relative w-full bg-slate-50 overflow-hidden">

      <style jsx global>{`
        .hero-swiper {
          height: 85vh;
          min-height: 600px;
        }
        .hero-swiper .swiper-slide {
          height: 85vh;
          min-height: 600px;
          display: flex;
          align-items: center;
        }
        .swiper-pagination-bullet-active {
          background: #0ea5e9 !important;
          width: 24px !important;
          border-radius: 4px !important;
          transition: all 0.3s ease;
        }
        .swiper-button-next, .swiper-button-prev {
          color: #0ea5e9 !important;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(4px);
          width: 48px !important;
          height: 48px !important;
          border-radius: 50%;
          border: 1px solid #e0f2fe;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.1);
        }
        .swiper-button-next:after, .swiper-button-prev:after {
          font-size: 18px !important;
          font-weight: bold;
        }
        @media (max-width: 768px) {
          .swiper-button-next, .swiper-button-prev { display: none !important; }
          .hero-swiper,
          .hero-swiper .swiper-slide {
            height: auto;
            min-height: 100vh;
          }
        }
      `}</style>

      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        allowTouchMove={true}
        slidesPerView={1}
        navigation={true}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="hero-swiper w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* Left Column */}
              <div className="lg:col-span-6 space-y-6 text-left order-2 lg:order-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-600 border border-sky-100">
                  {slide.tag}
                </span>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-800 leading-[1.15] tracking-tight">
                  {slide.title}
                </h1>

                <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl">
                  {slide.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    href={slide.ctaLink}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 rounded-xl shadow-lg shadow-sky-200/80 hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
                  >
                    <span>{slide.ctaText}</span>
                    <FiArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/tutors"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/80 transition-colors"
                  >
                    <FiSearch className="text-slate-400" />
                    <span>How it Works</span>
                  </Link>
                </div>

                <div className="flex items-center gap-6 pt-4 border-t border-slate-100 text-slate-400 text-xs">
                  <div className="flex items-center gap-1">
                    <FiStar className="text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-slate-600">4.9/5</span> Rating
                  </div>
                  <div className="flex items-center gap-1">
                    <FiBookOpen className="text-sky-500" />
                    <span className="font-semibold text-slate-600">12k+</span> Certified Tutors
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-6 relative flex justify-center order-1 lg:order-2">
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] max-w-lg rounded-3xl overflow-hidden   bg-slate-100">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent" />
                </div>
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-sky-100 rounded-full -z-10 mix-blend-multiply filter blur-md opacity-70" />
                <div className="absolute -bottom-8 -left-6 w-32 h-32 bg-blue-100 rounded-full -z-10 mix-blend-multiply filter blur-lg opacity-60" />
              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Hero;