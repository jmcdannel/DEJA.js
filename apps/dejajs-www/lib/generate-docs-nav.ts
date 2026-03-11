import { getAllMdxFiles, parseMdx, CONTENT_DIR, getSlugFromFile } from './docs-utils';
import path from 'path';

export interface DocNavItem {
  title: string;
  href: string;
  order?: number;
  children?: DocNavItem[];
  comingSoon?: boolean;
}

const SECTION_ORDER = [
  'Getting Started',
  'Throttle',
  'Cloud',
  'Monitor',
  'Tour',
  'Server',
  'Sound API',
  'IO Devices',
  'Developer'
];

export function generateDocsNav(): DocNavItem[] {
  const files = getAllMdxFiles();
  const navMap: Record<string, { title: string; href: string; order: number; children: DocNavItem[] }> = {};

  // First pass: group by section
  for (const file of files) {
    const fullPath = path.join(CONTENT_DIR, file);
    const { data: frontmatter } = parseMdx(fullPath);
    
    // Default section mapping based on directory
    let sectionName = frontmatter.section;
    if (!sectionName) {
      if (file.startsWith('throttle/')) sectionName = 'Throttle';
      else if (file.startsWith('cloud/')) sectionName = 'Cloud';
      else if (file.startsWith('monitor/')) sectionName = 'Monitor';
      else if (file.startsWith('server/')) sectionName = 'Server';
      else if (file.startsWith('tour/')) sectionName = 'Tour';
      else if (file.startsWith('sound-api/')) sectionName = 'Sound API';
      else if (file.startsWith('io/')) sectionName = 'IO Devices';
      else if (file.startsWith('dev/')) sectionName = 'Developer';
      else sectionName = 'Getting Started';
    }

    const slugArray = getSlugFromFile(file) || [];
    const href = `/docs${slugArray.length > 0 ? '/' + slugArray.join('/') : ''}`;
    
    const item: DocNavItem = {
      title: frontmatter.title || path.basename(file, '.mdx').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      href,
      order: frontmatter.order || 999,
    };

    if (!navMap[sectionName]) {
      // Determine base href for section
      let sectionHref = '/docs';
      if (sectionName !== 'Getting Started') {
        const sectionSlug = file.split('/')[0];
        sectionHref = `/docs/${sectionSlug}`;
      }
      
      navMap[sectionName] = {
        title: sectionName,
        href: sectionHref,
        order: 999,
        children: []
      };
    }
    
    // If this is the "Overview" page for the section, use its href as the section href
    if (file.endsWith('overview.mdx') || file === 'getting-started.mdx' || item.title.toLowerCase() === 'overview') {
      // Wait, overview usually acts as the parent section link.
      // E.g., /docs/throttle is Throttle (overview), /docs/throttle/home is Home.
      if (sectionName !== 'Getting Started') {
        navMap[sectionName].href = href;
      }
    }

    navMap[sectionName].children.push(item);
  }

  const result: DocNavItem[] = [];

  for (const sectionName of Object.keys(navMap)) {
    const section = navMap[sectionName];
    // Sort children
    section.children.sort((a, b) => {
      // Push "overview" to top
      if (a.title.toLowerCase() === 'overview') return -1;
      if (b.title.toLowerCase() === 'overview') return 1;
      return (a.order || 999) - (b.order || 999);
    });
    
    // Add to result
    result.push({
      title: section.title,
      href: section.href,
      children: section.children.length > 1 ? section.children : undefined, // Simplify if only 1 child
    });
  }

  // Sort sections
  result.sort((a, b) => {
    let indexA = SECTION_ORDER.indexOf(a.title);
    let indexB = SECTION_ORDER.indexOf(b.title);
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    return indexA - indexB;
  });

  // Preserve comingSoon items
  result.push(
    { title: 'Program', href: '#', comingSoon: true },
    { title: 'AI Ops', href: '#', comingSoon: true },
    { title: 'Dispatcher', href: '#', comingSoon: true }
  );

  return result;
}
