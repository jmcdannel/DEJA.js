// 📱💻 CSS-only phone or laptop frame around a screenshot.

import Image from 'next/image';

interface DeviceMockupProps {
  variant: 'phone' | 'laptop';
  src: string;
  alt: string;
}

export default function DeviceMockup({ variant, src, alt }: DeviceMockupProps) {
  if (variant === 'phone') {
    return (
      <div className="relative w-[280px] md:w-[320px] aspect-[9/19] rounded-[3rem] bg-slate-900 border-[8px] border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full bg-slate-950 z-10" />
        <Image
          src={src}
          alt={alt}
          width={320}
          height={640}
          className="w-full h-full object-cover object-top"
        />
      </div>
    );
  }
  return (
    <div className="relative w-full max-w-[700px]">
      <div className="rounded-t-2xl bg-slate-900 border-[6px] border-slate-800 border-b-0 overflow-hidden aspect-[16/10]">
        <Image
          src={src}
          alt={alt}
          width={800}
          height={500}
          className="w-full h-full object-cover object-top"
        />
      </div>
      <div className="h-3 bg-slate-800 rounded-b-lg w-[110%] -ml-[5%] shadow-lg" />
    </div>
  );
}
