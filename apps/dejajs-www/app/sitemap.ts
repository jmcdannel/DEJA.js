import type { MetadataRoute } from 'next';
import { getAllMdxFiles, getSlugFromFile } from '../lib/docs-utils';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://dejajs.com';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${baseUrl}/server`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/throttle`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/cloud`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/monitor`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/tour`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
  ];

  const docsFiles = getAllMdxFiles();
  const docsPages = docsFiles.map((file) => {
    const slugParams = getSlugFromFile(file) || [];
    const path = slugParams.length > 0 ? '/' + slugParams.join('/') : '';
    return {
      url: `${baseUrl}/docs${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    };
  });

  return [...staticPages, ...docsPages];
}
