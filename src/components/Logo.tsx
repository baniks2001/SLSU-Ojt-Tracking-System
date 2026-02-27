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
      <Image
        src="/state%20u%20logo.png"
        alt="SLSU OJT Tracking System"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  );
}
