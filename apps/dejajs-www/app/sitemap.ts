import type { MetadataRoute } from 'next';
import { getAllMdxFiles, getSlugFromFile } from '../lib/docs-utils';
import { client } from '../sanity/lib/client';
import { PRODUCT_SLUGS_QUERY } from '../sanity/lib/queries';

const defaultProductSlugs = ['server', 'throttle', 'cloud', 'monitor', 'tour'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://dejajs.com';

  let productSlugs = defaultProductSlugs;
  try {
    const sanityProducts = await client.fetch(PRODUCT_SLUGS_QUERY);
    if (sanityProducts?.length) {
      productSlugs = sanityProducts.map((p: { slug: string }) => p.slug);
    }
  } catch {
    // Fall back to hardcoded slugs
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const productPages: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const docsFiles = getAllMdxFiles();
  const docsPages: MetadataRoute.Sitemap = docsFiles.map((file) => {
    const slugParams = getSlugFromFile(file) || [];
    const path = slugParams.length > 0 ? '/' + slugParams.join('/') : '';
    return {
      url: `${baseUrl}/docs${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    };
  });

  return [...staticPages, ...productPages, ...docsPages];
}
