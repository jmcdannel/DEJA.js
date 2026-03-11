import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getMdxFilePath, parseMdx, getAllMdxFiles, getSlugFromFile } from '../../../lib/docs-utils';
import { useMDXComponents } from '../../../components/mdx-components';
import React from 'react';

export async function generateStaticParams() {
  const files = getAllMdxFiles();
  return files.map((file) => ({
    slug: getSlugFromFile(file) || [],
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  // Fix Next.js 15: params is a Promise.
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug || [];
  
  const mdxPath = getMdxFilePath(slug);
  if (!mdxPath) {
    return { title: 'Not Found' };
  }

  const { data: frontmatter } = parseMdx(mdxPath);

  return {
    title: `${frontmatter.title || 'Documentation'} - DEJA.js`,
    description: frontmatter.description || 'DEJA.js Documentation',
  };
}

export default async function DocsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  // Unwrap promise for Next.js 15 app router compatibility
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug || [];
  
  const mdxPath = getMdxFilePath(slug);

  if (!mdxPath) {
    notFound();
  }

  const { data: frontmatter, content } = parseMdx(mdxPath);
  const components = useMDXComponents({});

  return (
    <div className="prose dark:prose-invert max-w-none">
      <MDXRemote source={content} components={components} />
    </div>
  );
}
