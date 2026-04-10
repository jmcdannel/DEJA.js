import Image from 'next/image';

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type LogoVariant =
  | 'default'
  | 'throttle'
  | 'server'
  | 'cloud'
  | 'io'
  | 'monitor'
  | 'tour';
export type LogoIconShape = 'rounded' | 'circle';
export type LogoLayout = 'inline' | 'stacked' | 'product';

interface LogoProps {
  size?: LogoSize;
  showIcon?: boolean;
  showWordmark?: boolean;
  appTitle?: string;
  iconSrc?: string;
  variant?: LogoVariant;
  iconShape?: LogoIconShape;
  layout?: LogoLayout;
  /** @deprecated use `layout="stacked"` instead. */
  stacked?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const variantBrandColor: Record<LogoVariant, string | undefined> = {
  default: undefined,
  throttle: '#43F20D',
  server: '#FF0700',
  cloud: '#E40DF2',
  io: '#8D00FF',
  monitor: '#1A32E6',
  tour: '#F2B40D',
};

const productKickerSizeMap: Record<LogoSize, string> = {
  xs: 'text-[0.55rem]',
  sm: 'text-[0.55rem]',
  md: 'text-[0.65rem]',
  lg: 'text-xs',
  xl: 'text-sm',
  '2xl': 'text-base',
  '3xl': 'text-lg',
};

const productTitleSizeMap: Record<LogoSize, string> = {
  xs: 'text-2xl',
  sm: 'text-3xl',
  md: 'text-4xl',
  lg: 'text-5xl',
  xl: 'text-6xl',
  '2xl': 'text-7xl',
  '3xl': 'text-8xl',
};

const sizeMap = {
  xs:  { brand: 'text-sm',  js: 'text-[0.55rem]', iconPx: 16, gap: 'gap-1',   title: 'text-xs' },
  sm:  { brand: 'text-lg',  js: 'text-[0.7rem]',  iconPx: 24, gap: 'gap-1.5', title: 'text-sm' },
  md:  { brand: 'text-2xl', js: 'text-[1rem]',    iconPx: 32, gap: 'gap-2',   title: 'text-lg' },
  lg:  { brand: 'text-3xl', js: 'text-[1.2rem]',  iconPx: 40, gap: 'gap-2',   title: 'text-xl' },
  xl:  { brand: 'text-4xl', js: 'text-[1.5rem]',  iconPx: 48, gap: 'gap-3',   title: 'text-2xl' },
  '2xl': { brand: 'text-5xl', js: 'text-[1.8rem]', iconPx: 56, gap: 'gap-3', title: 'text-3xl' },
  '3xl': { brand: 'text-6xl', js: 'text-[2.2rem]', iconPx: 64, gap: 'gap-4', title: 'text-4xl' },
} as const;

const variantIconMap: Record<LogoVariant, string> = {
  default: '/icon-512.png',
  throttle: '/throttle/icon-512.png',
  server: '/server/icon-512.png',
  cloud: '/cloud/icon-512.png',
  io: '/io/icon-512.png',
  monitor: '/monitor/icon-512.png',
  tour: '/tour/icon-512.png',
};

export default function Logo({
  size = 'md',
  showIcon = true,
  showWordmark = true,
  appTitle,
  iconSrc,
  variant = 'default',
  iconShape = 'rounded',
  layout = 'inline',
  stacked = false,
  className = '',
  children,
}: LogoProps) {
  const s = sizeMap[size];
  const resolvedIconSrc = iconSrc ?? variantIconMap[variant];
  const iconShapeClass =
    iconShape === 'circle' ? 'rounded-full overflow-hidden' : 'rounded-lg';

  // 🔁 Backwards compat: `stacked` boolean wins over `layout`.
  const resolvedLayout: LogoLayout = stacked ? 'stacked' : layout;
  const isProduct = resolvedLayout === 'product' && !!appTitle;

  const textContainerClass =
    resolvedLayout !== 'inline' && appTitle
      ? 'flex flex-col items-start gap-1'
      : `flex items-end ${s.gap}`;

  const brandColor = variantBrandColor[variant];

  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      {showIcon && (
        children || (
          <Image
            src={resolvedIconSrc}
            alt={`DEJA.js${appTitle ? ' ' + appTitle : ''}`}
            width={s.iconPx}
            height={s.iconPx}
            className={`inline-block drop-shadow-sm flex-shrink-0 ${iconShapeClass}`}
          />
        )
      )}

      {(showWordmark || appTitle) && (
        <span className={textContainerClass}>
          {isProduct ? (
            <>
              <span
                className={`font-mono uppercase tracking-[0.25em] text-gray-500 leading-none whitespace-nowrap ${productKickerSizeMap[size]}`}
              >
                DEJA.JS
              </span>
              <span
                className={`font-bold leading-none whitespace-nowrap ${productTitleSizeMap[size]}`}
                style={brandColor ? { color: brandColor } : undefined}
              >
                {appTitle}
              </span>
            </>
          ) : (
            <>
              {showWordmark && (
                <span className={`font-bold tracking-[0.08em] leading-none whitespace-nowrap ${s.brand}`}>
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">DEJA</span>
                  <span className="text-lime-400">.</span>
                  <span className={`text-fuchsia-500 font-mono ${s.js}`}>js</span>
                </span>
              )}

              {appTitle && (
                <span
                  className={`font-semibold leading-none whitespace-nowrap ${s.title}`}
                  style={brandColor ? { color: brandColor } : { color: 'white' }}
                >
                  {appTitle}
                </span>
              )}
            </>
          )}
        </span>
      )}
    </span>
  );
}
