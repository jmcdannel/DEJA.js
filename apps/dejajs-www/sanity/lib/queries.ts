import { defineQuery } from 'next-sanity'

// ─── Homepage ───────────────────────────────────────────
export const HOMEPAGE_QUERY = defineQuery(/* groq */ `
  *[_id == "homepage"][0]{
    hero {
      title,
      subtitle,
      cta { label, href, style }
    },
    productShowcase[]->{
      _id,
      title,
      "slug": slug.current,
      tagline,
      color,
      icon { asset->{ url } }
    },
    desktopCarousel[] {
      _key,
      image { asset->{ url, metadata { dimensions, lqip } } },
      alt,
      caption
    },
    mobileCarousel[] {
      _key,
      image { asset->{ url, metadata { dimensions, lqip } } },
      alt,
      caption
    },
    quickStartSection {
      title,
      description,
      videoUrl
    },
    architectureImage { asset->{ url } },
    secondaryCta { label, href, style }
  }
`)

// ─── Product Page ───────────────────────────────────────
export const PRODUCT_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "productPage" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    tagline,
    color,
    description,
    icon { asset->{ url } },
    features[] {
      _key,
      icon,
      title,
      description
    },
    cta { label, href, style },
    seoTitle,
    seoDescription
  }
`)

// ─── All Product Slugs (for validation) ─────────────────
export const PRODUCT_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "productPage" && defined(slug.current)]{ "slug": slug.current }
`)

// ─── FAQ ────────────────────────────────────────────────
export const FAQ_PAGE_QUERY = defineQuery(/* groq */ `
  *[_id == "faqPage"][0]{
    title,
    sections[] {
      _key,
      heading,
      entries[] {
        _key,
        question,
        answer
      }
    },
    seoTitle,
    seoDescription
  }
`)

// ─── Pricing ────────────────────────────────────────────
export const PRICING_PAGE_QUERY = defineQuery(/* groq */ `
  *[_id == "pricingPage"][0]{
    title,
    subtitle,
    tiers[] {
      _key,
      name,
      monthlyPrice,
      yearlyPrice,
      features,
      cta { label, href, style },
      highlighted
    },
    seoTitle,
    seoDescription
  }
`)

// ─── Site Settings (nav + footer) ───────────────────────
export const SITE_SETTINGS_QUERY = defineQuery(/* groq */ `
  *[_id == "siteSettings"][0]{
    siteName,
    productNavItems[] {
      _key,
      label,
      href,
      description,
      icon,
      comingSoon
    },
    docsNavItems[] {
      _key,
      label,
      href,
      description,
      comingSoon
    },
    footerLinks[] {
      _key,
      label,
      href
    },
    socialLinks[] {
      _key,
      label,
      href
    },
    loginUrl,
    signupUrl
  }
`)
