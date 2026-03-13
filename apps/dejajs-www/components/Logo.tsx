import Image from 'next/image';

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

interface LogoProps {
  size?: LogoSize;
  showIcon?: boolean;
  appTitle?: string;
  iconSrc?: string;
  className?: string;
  children?: React.ReactNode; // icon slot equivalent
}

const sizeMap = {
  xs:  { brand: 'text-sm',  js: 'text-[0.55rem]', iconPx: 16, gap: 'gap-1',   title: 'text-xs' },
  sm:  { brand: 'text-lg',  js: 'text-[0.7rem]',  iconPx: 24, gap: 'gap-1.5', title: 'text-sm' },
  md:  { brand: 'text-2xl', js: 'text-[1rem]',    iconPx: 32, gap: 'gap-2',   title: 'text-lg' },
  lg:  { brand: 'text-3xl', js: 'text-[1.2rem]',  iconPx: 40, gap: 'gap-2',   title: 'text-xl' },
  xl:  { brand: 'text-4xl', js: 'text-[1.5rem]',  iconPx: 48, gap: 'gap-3',   title: 'text-2xl' },
  '2xl': { brand: 'text-5xl', js: 'text-[1.8rem]', iconPx: 56, gap: 'gap-3', title: 'text-3xl' },
  '3xl': { brand: 'text-6xl', js: 'text-[2.2rem]', iconPx: 64, gap: 'gap-4', title: 'text-4xl' },
} as const;

export default function Logo({
  size = 'md',
  showIcon = true,
  appTitle,
  iconSrc = '/icon-192.png',
  className = '',
  children,
}: LogoProps) {
  const s = sizeMap[size];

  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      {/* Icon: children override or default Image */}
      {showIcon && (
        children || (
          <Image
            src={iconSrc}
            alt={`DEJA.js${appTitle ? ' ' + appTitle : ''}`}
            width={s.iconPx}
            height={s.iconPx}
            className="inline-block drop-shadow-sm rounded-lg flex-shrink-0"
          />
        )
      )}

      {/* Brand text */}
      <span className={`font-bold tracking-[0.08em] leading-none whitespace-nowrap ${s.brand}`}>
        <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">DEJA</span>
        <span className="text-lime-400">.</span>
        <span className={`text-fuchsia-500 font-mono ${s.js}`}>js</span>
      </span>

      {/* Optional app title suffix */}
      {appTitle && (
        <span className={`text-white font-semibold leading-none whitespace-nowrap ${s.title}`}>
          {appTitle}
        </span>
      )}
    </span>
  );
}
