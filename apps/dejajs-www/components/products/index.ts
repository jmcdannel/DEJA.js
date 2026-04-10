// 📦 Barrel export for the product page building-block library.

export { default as SectionHeading } from './SectionHeading';
export { default as ProductHero } from './ProductHero';
export { default as FeatureGrid } from './FeatureGrid';
export { default as Showcase } from './Showcase';
export { default as ScreenshotCarousel } from './ScreenshotCarousel';
export { default as DeviceMockup } from './DeviceMockup';
export { default as EzConsistStory } from './EzConsistStory';
export { default as PlatformBreadth } from './PlatformBreadth';
export { default as HardwareGallery } from './HardwareGallery';
export { default as FreeToTryBanner } from './FreeToTryBanner';
export { default as ProductCTA } from './ProductCTA';
export { getAccent, PRODUCT_ACCENTS } from './productAccents';
export type {
  ProductSlug,
  Feature,
  CTAAction,
  Screenshot,
  ProductAccent,
  ProductContent,
} from './types';
