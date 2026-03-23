'use client';

import Image from 'next/image';

interface PhoneMockupProps {
  src: string;
  alt: string;
  className?: string;
}

export default function PhoneMockup({ src, alt, className = '' }: PhoneMockupProps) {
  return (
    <div className={`relative w-[180px] ${className}`}>
      <div className="rounded-[24px] border-2 border-gray-700 bg-gray-900 p-2 shadow-2xl">
        <div className="mx-auto w-16 h-1.5 bg-gray-800 rounded-full mb-1.5" />
        <div className="rounded-[16px] overflow-hidden">
          <Image src={src} alt={alt} width={360} height={780} className="w-full h-auto" />
        </div>
        <div className="mx-auto w-12 h-1 bg-gray-700 rounded-full mt-2" />
      </div>
    </div>
  );
}
