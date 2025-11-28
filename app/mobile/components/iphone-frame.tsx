/**
 * iPhone Frame Component
 * 
 * Renders content inside a realistic iPhone-style device frame with modern proportions.
 * Features Dynamic Island (default) or notch, slim bezels, and home indicator matching current iPhone models.
 * Supports iframe embedding and customizable scaling.
 */

"use client";

import { ReactNode, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";

interface iPhoneFrameProps {
  children?: ReactNode;
  src?: string; // iframe URL
  scale?: number; // 0.5 to 2.0, default 1.0
  variant?: 'dynamic-island' | 'notch'; // default 'dynamic-island'
  frameColor?: 'space-gray' | 'silver' | 'gold' | 'blue' | 'natural';
  className?: string;
}

const FRAME_COLORS = {
  'space-gray': 'from-gray-800 to-black',
  'silver': 'from-gray-200 to-gray-400',
  'gold': 'from-amber-300 to-amber-500',
  'blue': 'from-blue-600 to-blue-800',
  'natural': 'from-slate-400 to-slate-600',
} as const;

export default function iPhoneFrame({ 
  children, 
  src,
  scale = 1.0,
  variant = 'dynamic-island',
  frameColor = 'space-gray',
  className
}: iPhoneFrameProps) {
  // Register service worker for PWA support
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          // Service Worker registered successfully
        })
        .catch(() => {
          // Service Worker registration failed - fail silently
        });
    }
  }, []);

  // Clamp scale between 0.5 and 2.0
  const clampedScale = Math.max(0.5, Math.min(2.0, scale));
  const frameGradient = FRAME_COLORS[frameColor];
  
  // Status bar and home indicator heights (fixed, scale applied via transform)
  const statusBarHeight = variant === 'dynamic-island' ? 59 : 47;
  const homeIndicatorHeight = 34;

  const scrollbarStyles = useMemo(() => ({
    scrollbarWidth: 'none' as const,
    msOverflowStyle: 'none' as const,
  }), []);

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8",
      className
    )}>
      {/* iPhone Frame Container - Wrapper for scaling */}
      <div 
        className="relative mx-auto origin-center"
        style={{
          width: '390px',
          height: '844px',
          transform: `scale(${clampedScale})`,
          transformOrigin: 'center',
        }}
      >
        {/* Device Frame with Slim Bezels */}
        <div className={cn(
          "relative rounded-[2.5rem] p-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_25px_70px_rgba(0,0,0,0.6)]",
          `bg-gradient-to-b ${frameGradient}`
        )}>
          {/* Inner Screen */}
          <div className="relative bg-black rounded-[2.4rem] overflow-hidden" style={{ width: '390px', height: '844px' }}>
            {/* Status Bar Area */}
            <div className="relative bg-black" style={{ height: `${statusBarHeight}px` }}>
              {variant === 'dynamic-island' ? (
                <>
                  {/* Speaker Grille - Subtle horizontal lines above Dynamic Island */}
                  <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[60px] h-[4px] flex items-center justify-center gap-[2px] z-0">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="w-[6px] h-[1px] bg-white/20 rounded-full" />
                    ))}
                  </div>
                  
                  {/* Dynamic Island - Pill shape */}
                  <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-black rounded-full z-10 flex items-center justify-center gap-[6px]">
                    {/* TrueDepth Camera Array - 3 dots */}
                    <div className="flex items-center gap-[4px]">
                      {/* Camera */}
                      <div className="w-[6px] h-[6px] rounded-full bg-gray-700 border border-gray-600" />
                      {/* Dot Projector */}
                      <div className="w-[4px] h-[4px] rounded-full bg-gray-600" />
                      {/* Flood Illuminator */}
                      <div className="w-[4px] h-[4px] rounded-full bg-gray-600" />
                    </div>
                  </div>
                  
                  {/* Status Bar Content - Positioned around Dynamic Island */}
                  <div className="relative h-full flex items-center justify-between px-[22px] pt-[5px] z-20">
                    <div className="flex items-center text-white text-[15px] font-semibold leading-none">
                      <span>9:41</span>
                    </div>
                    <div className="flex items-center gap-[5px]">
                      {/* Signal Bars */}
                      <div className="flex items-end gap-[3px]">
                        <div className="w-[3px] h-[4px] bg-white rounded-t-[1px]" />
                        <div className="w-[3px] h-[6px] bg-white rounded-t-[1px]" />
                        <div className="w-[3px] h-[8px] bg-white rounded-t-[1px]" />
                        <div className="w-[3px] h-[4px] bg-white/40 rounded-t-[1px]" />
                      </div>
                      {/* WiFi Icon */}
                      <svg className="w-[16px] h-[12px] text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.076 13.308-5.076 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      {/* Battery Icon */}
                      <div className="flex items-center gap-[3px]">
                        <div className="w-[1px] h-[7px] bg-white/60" />
                        <div className="w-[24px] h-[12px] border border-white/60 rounded-[2.5px] p-[1.5px]">
                          <div className="w-full h-full bg-white/60 rounded-[1px]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Notch - Legacy iPhone style */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-black rounded-b-[21px] z-10" />
                  {/* Status Bar Content */}
                  <div className="relative h-full flex items-center justify-between px-[22px] pt-[5px] z-20">
                    <div className="flex items-center text-white text-[15px] font-semibold leading-none">
                      <span>9:41</span>
                    </div>
                    <div className="flex items-center gap-[5px]">
                      {/* Signal Bars */}
                      <div className="flex items-end gap-[3px]">
                        <div className="w-[3px] h-[4px] bg-white rounded-t-[1px]" />
                        <div className="w-[3px] h-[6px] bg-white rounded-t-[1px]" />
                        <div className="w-[3px] h-[8px] bg-white rounded-t-[1px]" />
                        <div className="w-[3px] h-[4px] bg-white/40 rounded-t-[1px]" />
                      </div>
                      {/* WiFi Icon */}
                      <svg className="w-[16px] h-[12px] text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.076 13.308-5.076 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      {/* Battery Icon */}
                      <div className="flex items-center gap-[3px]">
                        <div className="w-[1px] h-[7px] bg-white/60" />
                        <div className="w-[24px] h-[12px] border border-white/60 rounded-[2.5px] p-[1.5px]">
                          <div className="w-full h-full bg-white/60 rounded-[1px]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* App Content Area - No visible scrollbars */}
            <div 
              className="relative bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              style={{
                height: `${844 - statusBarHeight - homeIndicatorHeight}px`,
                ...scrollbarStyles,
              }}
            >
              {src ? (
                <iframe
                  src={src}
                  className="w-full h-full border-0"
                  allow="fullscreen"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                  title="iPhone Frame Content"
                />
              ) : (
                children
              )}
            </div>

            {/* Home Indicator - Modern style */}
            <div className="relative bg-black flex items-center justify-center" style={{ height: `${homeIndicatorHeight}px` }}>
              <div className="w-[134px] h-[5px] bg-white/40 rounded-full" />
            </div>
          </div>
        </div>

        {/* Decorative Glow Effect */}
        <div className={cn(
          "absolute -z-10 inset-0 rounded-[2.5rem] blur-2xl opacity-25",
          `bg-gradient-to-br ${frameGradient}`
        )} />
      </div>
    </div>
  );
}
