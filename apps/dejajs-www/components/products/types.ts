// 🧱 Shared types for the product page building-block library.

export type ProductSlug =
  | 'throttle'
  | 'server'
  | 'cloud'
  | 'io'
  | 'monitor'
  | 'tour';

export interface Feature {
  icon: string; // emoji
  title: string;
  description: string;
}

export interface CTAAction {
  /** Required for primary and guide CTAs; secondary (docs) CTAs ignore this — DocLink uses the product name. */
  label?: string;
  href: string;
  style?: 'primary' | 'secondary' | 'ghost';
  external?: boolean;
}

export interface Screenshot {
  src: string;
  alt: string;
  caption?: string;
}

export interface ProductAccent {
  slug: ProductSlug;
  /** Display name, e.g. 'Throttle' */
  name: string;
  /** Tailwind text class, e.g. 'text-deja-throttle' */
  textClass: string;
  /** Tailwind bg class, e.g. 'bg-deja-throttle' */
  bgClass: string;
  /** Tailwind border class, e.g. 'border-deja-throttle' */
  borderClass: string;
  /** Glow utility class defined in globals.css */
  glowClass: string;
}

export interface ProductContent {
  slug: ProductSlug;
  name: string;
  icon: string; // path under /public
  tagline: string;
  heroKicker?: string;
  features: Feature[];
  ctas: {
    primary: CTAAction;
    secondary?: CTAAction;
    guide?: CTAAction;
  };
  seo: {
    title: string;
    description: string;
  };
}
