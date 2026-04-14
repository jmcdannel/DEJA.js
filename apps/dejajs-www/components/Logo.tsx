import Image from 'next/image';
import type { ProductSlug } from './products/types';

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type LogoVariant = 'default' | ProductSlug;
export type LogoIconShape = 'rounded' | 'circle';
export type LogoLayout = 'inline' | 'stacked' | 'product';

interface LogoProps {
  size?: LogoSize;
  showMark?: boolean;
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

const sizeMap = {
  xs:  { brand: 'text-sm',  js: 'text-[0.55rem]', iconPx: 16, gap: 'gap-1',   title: 'text-xs',  productKicker: 'text-[0.55rem]', productTitle: 'text-2xl' },
  sm:  { brand: 'text-lg',  js: 'text-[0.7rem]',  iconPx: 24, gap: 'gap-1.5', title: 'text-sm',  productKicker: 'text-[0.55rem]', productTitle: 'text-3xl' },
  md:  { brand: 'text-2xl', js: 'text-[1rem]',    iconPx: 32, gap: 'gap-2',   title: 'text-lg',  productKicker: 'text-[0.65rem]', productTitle: 'text-4xl' },
  lg:  { brand: 'text-3xl', js: 'text-[1.2rem]',  iconPx: 40, gap: 'gap-2',   title: 'text-xl',  productKicker: 'text-xs',        productTitle: 'text-5xl' },
  xl:  { brand: 'text-4xl', js: 'text-[1.5rem]',  iconPx: 48, gap: 'gap-3',   title: 'text-2xl', productKicker: 'text-sm',        productTitle: 'text-6xl' },
  '2xl': { brand: 'text-5xl', js: 'text-[1.8rem]', iconPx: 56, gap: 'gap-3',   title: 'text-3xl', productKicker: 'text-base',      productTitle: 'text-7xl' },
  '3xl': { brand: 'text-6xl', js: 'text-[2.2rem]', iconPx: 64, gap: 'gap-4',   title: 'text-4xl', productKicker: 'text-lg',        productTitle: 'text-8xl' },
} as const;

const productVariantIconPath = (slug: LogoVariant): string =>
  slug === 'default' ? '/icon-512.png' : `/${slug}/icon-512.png`;

const variantBrandColorVar = (variant: LogoVariant): string | undefined =>
  variant === 'default' ? undefined : `var(--color-deja-${variant})`;

export default function Logo({
  size = 'md',
  showMark = true,
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
  const resolvedIconSrc = iconSrc ?? productVariantIconPath(variant);
  const iconShapeClass =
    iconShape === 'circle' ? 'rounded-full overflow-hidden' : 'rounded-lg';

  const resolvedLayout: LogoLayout = stacked ? 'stacked' : layout;
  const isProduct = resolvedLayout === 'product' && !!appTitle;

  const textContainerClass =
    resolvedLayout !== 'inline' && appTitle
      ? 'flex flex-col items-start gap-1'
      : `flex items-end ${s.gap}`;

  const brandColor = variantBrandColorVar(variant);

  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      {showMark && (
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
                className={`font-mono uppercase tracking-[0.25em] text-gray-500 leading-none whitespace-nowrap ${s.productKicker}`}
              >
                DEJA.JS
              </span>
              <span
                className={`font-bold leading-none whitespace-nowrap ${s.productTitle}`}
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
