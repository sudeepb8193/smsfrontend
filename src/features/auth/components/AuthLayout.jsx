import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { SmsLogo } from './SmsLogo';
import loginImg from '../../../assets/images/loginimg.png';
import {
  Calendar,
  Users,
  Boxes,
  TrendingUp,
  Check,
  Sparkles,
  DoorOpen,
} from 'lucide-react';

/**
 * Custom React 19 safe GSAP context hook
 * Uses standard useEffect to guarantee clean lifecycle without dual-bundle useRef mismatches.
 */
const useGSAPContext = (callback, scopeRef, deps = []) => {
  useEffect(() => {
    const ctx = gsap.context(callback, scopeRef?.current || scopeRef);
    return () => ctx.revert();
  }, deps);
};

/**
 * Luxury Salon Authentication Layout with Door Concepts & GSAP Motion
 * - Left: Cinematic Salon Atmosphere with Parting French Doors
 * - Right: Smooth Form Container with Lavender Focus & Hover States
 * - Door concept: Doors close and open from left and right on load and route navigation
 */
export const AuthLayout = ({
  mode = 'login', // 'login' | 'register'
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const containerRef = useRef(null);
  const leftPanelRef = useRef(null);
  const bgImageRef = useRef(null);
  const leftContentRef = useRef(null);
  const rightPanelRef = useRef(null);
  const formCardRef = useRef(null);
  const featuresRef = useRef(null);

  // Door concept refs
  const doorsContainerRef = useRef(null);
  const doorLeftRef = useRef(null);
  const doorRightRef = useRef(null);
  const doorMedallionRef = useRef(null);
  const doorLightBeamRef = useRef(null);

  const [doorAnimating, setDoorAnimating] = useState(false);
  const isLogin = mode === 'login';

  /**
   * Run the doors opening sequence (from center seam outward to left and right)
   */
  const openDoors = () => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (doorsContainerRef.current) doorsContainerRef.current.style.display = 'none';
      if (bgImageRef.current) gsap.set(bgImageRef.current, { scale: 1, opacity: 0.78 });
      if (rightPanelRef.current) gsap.set(rightPanelRef.current, { opacity: 1, x: 0 });
      return;
    }

    if (doorsContainerRef.current) {
      doorsContainerRef.current.style.display = 'flex';
      setDoorAnimating(true);
    }

    // Reset doors closed at center
    gsap.set(doorLeftRef.current, { xPercent: 0, rotateY: 0 });
    gsap.set(doorRightRef.current, { xPercent: 0, rotateY: 0 });
    gsap.set(doorMedallionRef.current, { scale: 1, opacity: 1 });
    gsap.set(doorLightBeamRef.current, { opacity: 1, scaleX: 1 });

    const openTl = gsap.timeline({
      onComplete: () => {
        setDoorAnimating(false);
        if (doorsContainerRef.current) {
          doorsContainerRef.current.style.display = 'none';
        }
      },
    });

    // 1. Center medallion flare & light beam expand
    openTl
      .to(
        doorMedallionRef.current,
        {
          scale: 1.15,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
        },
        0.08
      )
      .to(
        doorLightBeamRef.current,
        {
          opacity: 0,
          scaleX: 5,
          duration: 0.55,
          ease: 'power2.out',
        },
        0.12
      )
      // 2. Left door swings/slides to left, Right door swings/slides to right
      .to(
        doorLeftRef.current,
        {
          xPercent: -100,
          rotateY: -10,
          duration: 0.95,
          ease: 'power3.inOut',
        },
        0.18
      )
      .to(
        doorRightRef.current,
        {
          xPercent: 100,
          rotateY: 10,
          duration: 0.95,
          ease: 'power3.inOut',
        },
        0.18
      );

    // 3. Salon background reveal behind the doors
    if (bgImageRef.current) {
      openTl.fromTo(
        bgImageRef.current,
        { scale: 1.06, opacity: 0.2 },
        { scale: 1, opacity: 0.78, duration: 1.1, ease: 'power3.out' },
        0.22
      );
    }

    // 4. Left panel text elements coordinated reveal
    if (leftContentRef.current) {
      const leftElements = containerRef.current.querySelectorAll('.gsap-left-item');
      openTl.fromTo(
        leftElements,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
        },
        0.35
      );
    }

    // 5. Feature cards pop-in
    if (featuresRef.current) {
      const featureItems = featuresRef.current.querySelectorAll('.gsap-feature-card');
      openTl.fromTo(
        featureItems,
        { opacity: 0, scale: 0.92, y: 12 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.07,
          ease: 'back.out(1.2)',
        },
        0.5
      );
    }

    // 6. Right form panel entrance
    if (rightPanelRef.current) {
      openTl.fromTo(
        rightPanelRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' },
        0.3
      );
    }

    // 7. Form fields staggered reveal
    if (formCardRef.current) {
      const formElements = formCardRef.current.querySelectorAll('.gsap-form-item');
      openTl.fromTo(
        formElements,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.out',
        },
        0.42
      );
    }
  };

  /**
   * Navigate with door closing animation from left and right towards center
   */
  const handleNavigateWithDoors = (targetPath) => {
    if (doorAnimating) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      navigate(targetPath);
      return;
    }

    setDoorAnimating(true);
    if (doorsContainerRef.current) {
      doorsContainerRef.current.style.display = 'flex';
    }

    // Start with doors open
    gsap.set(doorLeftRef.current, { xPercent: -100, rotateY: -10 });
    gsap.set(doorRightRef.current, { xPercent: 100, rotateY: 10 });
    gsap.set(doorMedallionRef.current, { opacity: 0, scale: 0.85 });
    gsap.set(doorLightBeamRef.current, { opacity: 0, scaleX: 3 });

    const closeTl = gsap.timeline({
      onComplete: () => {
        // Once doors close at center, navigate to destination
        navigate(targetPath, { state: { fromDoorTransition: true } });
      },
    });

    closeTl
      .to(
        doorLeftRef.current,
        {
          xPercent: 0,
          rotateY: 0,
          duration: 0.4,
          ease: 'power3.in',
        },
        0
      )
      .to(
        doorRightRef.current,
        {
          xPercent: 0,
          rotateY: 0,
          duration: 0.4,
          ease: 'power3.in',
        },
        0
      )
      .to(
        doorLightBeamRef.current,
        {
          opacity: 1,
          scaleX: 1,
          duration: 0.25,
          ease: 'power2.out',
        },
        0.2
      )
      .to(
        doorMedallionRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.25,
          ease: 'back.out(1.4)',
        },
        0.22
      );
  };

  // Replay door animation on demand
  const handleReplayDoors = () => {
    if (doorAnimating) return;
    openDoors();
  };

  // Execute door open animation when mounting or navigating
  useGSAPContext(
    () => {
      openDoors();
    },
    containerRef,
    [mode, location.pathname]
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full flex bg-[#F5F6FA] text-slate-800 font-sans overflow-x-hidden selection:bg-primary-500 selection:text-white relative"
    >
      {/* ===================================================================
          CINEMATIC LUXURY SALON DOUBLE DOORS (Opens & Closes from Left & Right)
          =================================================================== */}
      <div
        ref={doorsContainerRef}
        className="fixed inset-0 z-50 pointer-events-none flex overflow-hidden"
        style={{ perspective: '1200px' }}
        aria-hidden="true"
      >
        {/* Left Door Leaf (Opens to the left) */}
        <div
          ref={doorLeftRef}
          className="w-1/2 h-full bg-[#0B0D14] relative flex flex-col justify-between p-6 sm:p-10 border-r border-amber-400/35 shadow-[12px_0_35px_rgba(0,0,0,0.9)] origin-left"
          style={{ willChange: 'transform' }}
        >
          {/* Subtle panel frame molding */}
          <div className="absolute inset-4 sm:inset-8 border border-white/5 rounded-2xl pointer-events-none" />
          <div className="absolute inset-8 sm:inset-14 border border-amber-400/10 rounded-xl pointer-events-none" />
          <div className="absolute top-1/4 -right-16 w-64 h-64 bg-purple-600/10 rounded-full blur-[90px] pointer-events-none" />

          {/* Luxury Brass / Gold Salon Handle on edge */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-2 h-44 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-200/40" />

          {/* Top Brand tag */}
          <div className="relative z-10 flex items-center gap-2 text-amber-400/80">
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span className="text-[10px] sm:text-[11px] tracking-[0.25em] font-bold uppercase font-mono">
              SalonFlow Pro • Suite
            </span>
          </div>

          {/* Bottom Watermark */}
          <div className="relative z-10 text-[10px] sm:text-xs text-slate-500 tracking-widest font-mono">
            EST. 2026 • LUXURY SALON
          </div>
        </div>

        {/* Center Vertical Light Beam on door seam */}
        <div
          ref={doorLightBeamRef}
          className="absolute left-1/2 top-0 bottom-0 w-1.5 -translate-x-1/2 bg-gradient-to-b from-amber-300 via-purple-400 to-amber-400 shadow-[0_0_35px_12px_rgba(168,85,247,0.7)] z-20 pointer-events-none"
        />

        {/* Center Medallion Emblem */}
        <div
          ref={doorMedallionRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center pointer-events-none"
        >
          <div className="relative p-5 sm:p-6 rounded-3xl bg-[#0F121C]/95 backdrop-blur-2xl border border-amber-400/50 shadow-[0_0_50px_rgba(168,85,247,0.4)] flex items-center justify-center">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500 to-purple-500 opacity-40 blur-md pointer-events-none animate-pulse" />
            <SmsLogo variant="dark" size="md" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-amber-300/80 font-mono mt-3">
            Opening Doors...
          </span>
        </div>

        {/* Right Door Leaf (Opens to the right) */}
        <div
          ref={doorRightRef}
          className="w-1/2 h-full bg-[#0D101A] relative flex flex-col justify-between p-6 sm:p-10 border-l border-amber-400/35 shadow-[-12px_0_35px_rgba(0,0,0,0.9)] origin-right"
          style={{ willChange: 'transform' }}
        >
          {/* Subtle panel frame molding */}
          <div className="absolute inset-4 sm:inset-8 border border-white/5 rounded-2xl pointer-events-none" />
          <div className="absolute inset-8 sm:inset-14 border border-amber-400/10 rounded-xl pointer-events-none" />
          <div className="absolute bottom-1/4 -left-16 w-64 h-64 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

          {/* Luxury Brass / Gold Salon Handle on edge */}
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-2 h-44 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-200/40" />

          {/* Top Brand tag */}
          <div className="relative z-10 text-right text-slate-400">
            <span className="text-[10px] sm:text-[11px] tracking-[0.25em] font-bold uppercase font-mono">
              Grand Entrance
            </span>
          </div>

          {/* Bottom Watermark */}
          <div className="relative z-10 text-right text-[10px] sm:text-xs text-slate-500 tracking-widest font-mono">
            AUTHENTICATION PORTAL
          </div>
        </div>
      </div>

      {/* ===================================================================
          LEFT PANEL: Premium Salon Interior Showcase (Hidden on Mobile)
          =================================================================== */}
      <div
        ref={leftPanelRef}
        className="hidden lg:flex lg:w-1/2 relative min-h-screen overflow-hidden bg-[#0C0E14] text-white flex-col justify-between p-6 xl:p-10 2xl:p-12 select-none"
      >
        {/* Salon Interior Background with Parallax/Zoom */}
        <div
          ref={bgImageRef}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 ease-out will-change-transform opacity-75"
          style={{ backgroundImage: `url(${loginImg})` }}
        />

        {/* Charcoal Gradient Overlay to guarantee high contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C0E14] via-[#0C0E14]/85 to-[#0C0E14]/40 backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0E14] via-transparent to-[#0C0E14]/70" />

        {/* Ambient Glowing Accents (Warm Amber + Rich Lavender) */}
        <div className="absolute top-1/4 -left-16 w-80 h-80 bg-orange-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-purple-600/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-10 -left-10 w-64 h-64 bg-amber-500/15 rounded-full blur-[90px] pointer-events-none" />

        {/* Golden Concentric Rings Overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none hidden xl:block z-0 overflow-hidden">
          <svg className="absolute -left-12 top-1/4 w-[480px] h-[480px] pointer-events-none opacity-20" viewBox="0 0 480 480" fill="none">
            <circle cx="240" cy="240" r="110" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="240" cy="240" r="170" stroke="#F59E0B" strokeWidth="1" />
            <circle cx="240" cy="240" r="230" stroke="#F59E0B" strokeWidth="1" strokeDasharray="6 6" />
          </svg>
        </div>

        {/* Left Panel - Header: Frosted Glass Logo Badge + Door Replay Trigger */}
        <div className="relative z-10 flex items-center justify-between gsap-left-item">
          <div className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/20 shadow-lg shadow-black/30">
            <div className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-amber-400/40 rounded-full blur-sm pointer-events-none" />
            <SmsLogo variant="dark" size="sm" />
          </div>

          {/* Interactive Door Concept Replay Button */}
          <button
            type="button"
            onClick={handleReplayDoors}
            disabled={doorAnimating}
            title="Replay Salon Door Entrance"
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 hover:border-purple-400/50 text-slate-200 hover:text-white text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-purple-500/25 active:scale-95"
          >
            <DoorOpen size={14} className="text-amber-400 group-hover:text-purple-300 transition-colors" />
            <span className="text-[11px]">Replay Doors</span>
          </button>
        </div>

        {/* Left Panel - Middle: Value Proposition & Feature Highlights */}
        <div ref={leftContentRef} className="relative z-10 max-w-xl my-auto py-4 xl:py-6">
          {/* Main Headline */}
          {isLogin ? (
            <div className="space-y-3 xl:space-y-4">
              <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold tracking-tight text-white leading-[1.12] font-jakarta gsap-left-item">
                Manage Your Salon <br />
                <span className="bg-gradient-to-r from-amber-300 via-purple-300 to-amber-400 bg-clip-text text-transparent animate-shimmer-lavender">
                  Smarter, Not Harder
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-md gsap-left-item">
                Streamline your bookings, staff, clients, services and more — all in one place.
              </p>

              {/* 4 Feature Cards (Login view) with gentle floating animation */}
              <div
                ref={featuresRef}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-4 sm:pt-6 max-w-xl"
              >
                {[
                  { icon: Calendar, line1: 'Online', line2: 'Booking', floatClass: 'animate-float-1' },
                  { icon: Users, line1: 'Staff', line2: 'Management', floatClass: 'animate-float-2' },
                  { icon: Boxes, line1: 'Inventory &', line2: 'POS', floatClass: 'animate-float-3' },
                  { icon: TrendingUp, line1: 'Reports &', line2: 'Analytics', floatClass: 'animate-float-4' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`gsap-feature-card ${item.floatClass} group relative overflow-hidden flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-slate-900/55 backdrop-blur-xl border border-white/15 text-center shadow-lg shadow-black/25 hover:border-purple-400/60 hover:shadow-[0_0_24px_rgba(168,85,247,0.35)] hover:bg-slate-900/80 hover:-translate-y-1.5 transition-all duration-300 cursor-default`}
                  >
                    {/* Top edge glowing reflection beam */}
                    <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent pointer-events-none" />

                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-orange-400 group-hover:text-amber-300 mb-2 drop-shadow-[0_0_8px_rgba(249,115,22,0.45)] transition-colors duration-200">
                      <item.icon size={21} strokeWidth={1.8} />
                    </div>

                    <span className="text-[11px] sm:text-xs font-semibold text-slate-100 leading-tight">
                      {item.line1} <br />
                      {item.line2}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3 xl:space-y-4">
              <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold tracking-tight text-white leading-[1.12] font-jakarta gsap-left-item">
                Get Started <br />
                with{' '}
                <span className="bg-gradient-to-r from-amber-300 via-purple-300 to-amber-400 bg-clip-text text-transparent animate-shimmer-lavender">
                  Your Salon <br />
                  Journey
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-md pt-1 gsap-left-item">
                Create your account and take the first step towards a smarter SalonFlow Pro experience.
              </p>

              {/* Checklist Badges (Register view - stacked horizontal capsules) */}
              <div
                ref={featuresRef}
                className="space-y-2.5 sm:space-y-3 pt-3 sm:pt-4 max-w-lg"
              >
                {[
                  'Easy setup & instant online profile',
                  'Book appointments with favorite stylists 24/7',
                  'Track service history, receipts & appointments',
                  'Access exclusive salon rewards & promotions',
                ].map((text, idx) => (
                  <div
                    key={idx}
                    className="gsap-feature-card group relative overflow-hidden flex items-center gap-3.5 px-4 py-3 sm:py-3.5 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/15 shadow-lg shadow-black/25 hover:border-purple-400/60 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:bg-slate-900/70 hover:translate-x-1 transition-all duration-300 cursor-default"
                  >
                    {/* Top edge glowing reflection beam */}
                    <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent pointer-events-none" />

                    {/* Corner light flare on top card */}
                    {idx === 0 && (
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-amber-400/50 rounded-full blur-md pointer-events-none" />
                    )}

                    {/* Circular orange/amber checkmark badge */}
                    <div className="w-6 h-6 rounded-full border border-orange-400/90 flex items-center justify-center text-orange-400 shrink-0 bg-orange-500/10 shadow-[0_0_8px_rgba(249,115,22,0.35)]">
                      <Check size={13} strokeWidth={2.8} />
                    </div>

                    <span className="text-xs sm:text-[13px] font-medium text-slate-100 tracking-wide">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Left Panel - Footer: Luxury Editorial Tagline & Star Sparkle */}
        <div className="relative z-10 flex items-end justify-between w-full pt-4 border-t border-white/10 gsap-left-item">
          {isLogin ? (
            <div className="font-serif">
              <span className="block text-2xl xl:text-3xl text-white tracking-tight leading-tight">
                Better Management.
              </span>
              <span className="block text-2xl xl:text-3xl text-amber-400 tracking-tight leading-tight">
                Brighter Business.
              </span>
            </div>
          ) : (
            <div className="font-serif">
              <span className="block text-2xl xl:text-3xl text-white tracking-tight leading-tight">
                Your Salon.
              </span>
              <span className="block text-2xl xl:text-3xl text-amber-400 tracking-tight leading-tight">
                Our Priority.
              </span>
            </div>
          )}

          {/* 4-point Diamond Star Sparkle */}
          <div className="text-slate-200/90 pb-1">
            <svg
              className="w-6 h-6 text-slate-200 drop-shadow-[0_0_12px_rgba(255,255,255,0.85)]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* ===================================================================
          RIGHT PANEL: Clean White Authentication Form
          =================================================================== */}
      <div
        ref={rightPanelRef}
        className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 xl:p-10 bg-[#F5F6FA] overflow-y-auto"
      >
        {/* Top Bar with Switch Navigation */}
        <div className="w-full flex items-center justify-between pb-2">
          {/* Mobile Header Logo */}
          <div className="lg:hidden">
            <SmsLogo variant="light" size="sm" />
          </div>

          <div className="hidden lg:block">
            {/* Spacer for desktop layout balance */}
          </div>

          {/* Switch Link in top right corner with Door Navigation */}
          <div className="text-xs sm:text-sm text-slate-500 font-medium select-none">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleNavigateWithDoors('/register')}
                  className="font-bold text-primary-500 hover:text-primary-600 hover:underline transition-colors ml-1 cursor-pointer bg-transparent border-none p-0 inline"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleNavigateWithDoors('/login')}
                  className="font-bold text-primary-500 hover:text-primary-600 hover:underline transition-colors ml-1 cursor-pointer bg-transparent border-none p-0 inline"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>

        {/* Center: White Authentication Card */}
        <div className="w-full max-w-lg mx-auto my-auto py-2 sm:py-3">
          <div
            ref={formCardRef}
            className="w-full bg-white rounded-3xl p-5 sm:p-7 xl:p-8 shadow-xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden"
          >
            {/* Subtle top edge lavender shimmer */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent pointer-events-none" />

            {/* Form Branded Logo (Desktop) */}
            <div className="hidden lg:block mb-4 sm:mb-5 gsap-form-item">
              <SmsLogo variant="light" size="md" />
            </div>

            {children}
          </div>
        </div>

        {/* Footer info: centered copyright & door trigger */}
        <div className="w-full text-center text-[11px] text-slate-400 font-medium py-2 relative">
          <span>&copy; {new Date().getFullYear()} SalonFlow Pro. All rights reserved.</span>
          <button
            type="button"
            onClick={handleReplayDoors}
            disabled={doorAnimating}
            className="lg:hidden absolute right-0 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-600 font-semibold cursor-pointer text-[11px]"
          >
            Replay Doors
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
