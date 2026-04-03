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
  'Server',
  'Throttle',
  'Cloud',
  'Monitor',
  'Tour',
  'IO Devices'
];

function getSectionFromPath(file: string): string {
  if (file.startsWith('throttle/')) return 'Throttle';
  if (file.startsWith('cloud/')) return 'Cloud';
  if (file.startsWith('monitor/')) return 'Monitor';
  if (file.startsWith('server/')) return 'Server';
  if (file.startsWith('tour/')) return 'Tour';
  if (file.startsWith('io/')) return 'IO Devices';
  return 'Getting Started';
}

const NAV_TITLE_SUFFIXES = /\s+(Management|Configuration|Integration|View|Screen|List|Viewer|Library|Console)$/i;
const NAV_TITLE_PREFIXES = /^(Building|Explore|Locomotive)\s+/i;

function shortenNavTitle(title: string): string {
  return title.replace(NAV_TITLE_PREFIXES, '').replace(NAV_TITLE_SUFFIXES, '').trim();
}

function getSectionSlug(sectionName: string): string {
  const map: Record<string, string> = {
    'Throttle': 'throttle',
    'Cloud': 'cloud',
    'Monitor': 'monitor',
    'Server': 'server',
    'Tour': 'tour',
    'IO Devices': 'io',
  };
  return map[sectionName] || '';
}

export function generateDocsNav(): DocNavItem[] {
  const files = getAllMdxFiles();
  const navMap: Record<string, { title: string; href: string; order: number; children: DocNavItem[] }> = {};

  for (const file of files) {
    // Skip plans directory
    if (file.startsWith('plans/')) continue;

    const fullPath = path.join(CONTENT_DIR, file);
    const { data: frontmatter } = parseMdx(fullPath);

    // Always derive section from directory path, ignore frontmatter section
    const sectionName = getSectionFromPath(file);

    const slugArray = getSlugFromFile(file) || [];
    const href = `/docs${slugArray.length > 0 ? '/' + slugArray.join('/') : ''}`;

    const item: DocNavItem = {
      title: frontmatter.navTitle || shortenNavTitle(frontmatter.title || path.basename(file, '.mdx').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())),
      href,
      order: frontmatter.order || 999,
    };

    if (!navMap[sectionName]) {
      const slug = getSectionSlug(sectionName);
      navMap[sectionName] = {
        title: sectionName,
        href: slug ? `/docs/${slug}` : '/docs',
        order: 999,
        children: []
      };
    }

    // If this is the overview page, set it as the section href
    if (file.endsWith('overview.mdx') || file === 'getting-started.mdx') {
      if (sectionName !== 'Getting Started') {
        navMap[sectionName].href = href;
      }
    }

    navMap[sectionName].children.push(item);
  }

  const result: DocNavItem[] = [];

  for (const sectionName of Object.keys(navMap)) {
    const section = navMap[sectionName];
    // Sort children: overview first, then by order
    section.children.sort((a, b) => {
      const aIsOverview = a.href === section.href || a.title.toLowerCase().includes('overview') || a.title.toLowerCase().includes('getting started');
      const bIsOverview = b.href === section.href || b.title.toLowerCase().includes('overview') || b.title.toLowerCase().includes('getting started');
      if (aIsOverview && !bIsOverview) return -1;
      if (!aIsOverview && bIsOverview) return 1;
      return (a.order || 999) - (b.order || 999);
    });

    result.push({
      title: section.title,
      href: section.href,
      children: section.children.length > 1 ? section.children : undefined,
    });
  }

  // Sort sections by defined order
  result.sort((a, b) => {
    let indexA = SECTION_ORDER.indexOf(a.title);
    let indexB = SECTION_ORDER.indexOf(b.title);
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    return indexA - indexB;
  });

  // Append coming-soon items
  result.push(
    { title: 'Program', href: '#', comingSoon: true },
    { title: 'AI Ops', href: '#', comingSoon: true },
    { title: 'Dispatcher', href: '#', comingSoon: true }
  );

  return result;
}
