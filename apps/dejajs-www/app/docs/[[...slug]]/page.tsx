import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { getMdxFilePath, parseMdx, getAllMdxFiles, getSlugFromFile } from '../../../lib/docs-utils';
import { mdxComponents } from '../../../components/mdx-components';
import React from 'react';

export async function generateStaticParams() {
  const files = getAllMdxFiles();
  return files.map((file) => ({
    slug: getSlugFromFile(file) || [],
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params;
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
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];
  
  const mdxPath = getMdxFilePath(slug);

  if (!mdxPath) {
    notFound();
  }

  const { data: frontmatter, content } = parseMdx(mdxPath);
  const components = mdxComponents;

  return (
    <div className="prose dark:prose-invert max-w-none">
      <MDXRemote
        source={content}
        components={components}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </div>
  );
}
