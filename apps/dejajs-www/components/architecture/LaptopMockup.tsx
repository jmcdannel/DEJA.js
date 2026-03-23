'use client';

interface LaptopMockupProps {
  children: React.ReactNode;
  className?: string;
}

export default function LaptopMockup({ children, className = '' }: LaptopMockupProps) {
  return (
    <div className={`${className}`}>
      {/* Screen */}
      <div className="rounded-t-xl border-2 border-gray-600 border-b-0 bg-gray-900 p-1.5 shadow-2xl">
        {/* Webcam dot */}
        <div className="mx-auto w-2 h-2 bg-gray-800 rounded-full mb-1" />
        {/* Screen content */}
        <div className="rounded-lg overflow-hidden bg-gray-950">
          {children}
        </div>
      </div>
      {/* Hinge */}
      <div className="h-1 bg-gray-600 rounded-b-sm mx-2" />
      {/* Base / keyboard */}
      <div className="h-2 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-xl mx-[-4px]" />
      {/* Trackpad notch */}
      <div className="mx-auto w-12 h-0.5 bg-gray-700 rounded-full -mt-0.5" />
    </div>
  );
}
