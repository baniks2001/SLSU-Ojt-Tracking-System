'use client';

import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function Logo({ className = '', size = 'medium' }: LogoProps) {
  const dimensions = {
    small: { width: 32, height: 32 },
    medium: { width: 64, height: 64 },
    large: { width: 128, height: 128 },
  };

  const { width, height } = dimensions[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {/* 
        INSTRUCTIONS FOR REPLACING THE LOGO:
        
        1. Add your logo file (logo.png, logo.jpg, or logo.svg) to the /public folder
        2. Uncomment the Image component below and comment out the placeholder div
        3. Update the src path to match your logo filename
        
        Example:
        <Image
          src="/logo.png"
          alt="SLSU Logo"
          width={width}
          height={height}
          className="object-contain"
          priority
        />
      */}

      {/* PLACEHOLDER - Remove this div when you add your real logo */}
      <div
        className="bg-[#003366] rounded-lg flex items-center justify-center text-white font-bold"
        style={{ width, height }}
      >
        <span className="text-center text-xs px-2">
          SLSU
          <br />
          Logo
        </span>
      </div>

      {/* REAL LOGO - Uncomment and use this when you have your logo file */}
      {/*
      <Image
        src="/logo.png"
        alt="SLSU OJT Tracking System"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
      */}
    </div>
  );
}
