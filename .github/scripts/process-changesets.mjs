#!/usr/bin/env node

/**
 * process-changesets.mjs
 *
 * Reads .changeset/*.md files (excluding README.md), parses category prefixes,
 * groups entries by CHANGELOG section, and inserts them into the [Unreleased]
 * section of CHANGELOG.md. Consumed changeset files are deleted.
 *
 * Category prefix mapping:
 *   added: / (no prefix) → Added
 *   changed:              → Changed
 *   fixed:                → Fixed
 *   removed:              → Removed
 *   improved:             → Technical Improvements
 */

import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';

const CHANGESET_DIR = '.changeset';
const CHANGELOG_PATH = 'CHANGELOG.md';

const CATEGORY_MAP = {
  'added': 'Added',
  'changed': 'Changed',
  'fixed': 'Fixed',
  'removed': 'Removed',
  'improved': 'Technical Improvements',
};

// Order sections appear in the CHANGELOG
const SECTION_ORDER = ['Added', 'Changed', 'Fixed', 'Removed', 'Technical Improvements'];

/**
 * Parse a changeset file and extract the summary with its category.
 * Returns { category: string, entry: string } or null if invalid.
 */
function parseChangeset(content) {
  // Split on the YAML frontmatter delimiters
  const parts = content.split('---');
  if (parts.length < 3) return null;

  // Everything after the second --- is the summary
  const summary = parts.slice(2).join('---').trim();
  if (!summary) return null;

  // Check for category prefix
  const prefixMatch = summary.match(/^(added|changed|fixed|removed|improved):\s*/i);

  if (prefixMatch) {
    const prefix = prefixMatch[1].toLowerCase();
    const entry = summary.slice(prefixMatch[0].length);
    return {
      category: CATEGORY_MAP[prefix] || 'Added',
      entry: `- ${entry}`,
    };
  }

  // No prefix defaults to Added
  return {
    category: 'Added',
    entry: `- ${summary}`,
  };
}

/**
 * Insert grouped entries into the [Unreleased] section of the CHANGELOG.
 */
function updateChangelog(changelogContent, groupedEntries) {
  const lines = changelogContent.split('\n');
  const unreleasedIndex = lines.findIndex((line) => /^## \[Unreleased\]/.test(line));

  if (unreleasedIndex === -1) {
    console.error('Could not find [Unreleased] section in CHANGELOG.md');
    process.exit(1);
  }

  // Find the next section heading (## [...]) after [Unreleased]
  let nextSectionIndex = lines.length;
  for (let i = unreleasedIndex + 1; i < lines.length; i++) {
    if (/^## \[/.test(lines[i]) || /^---$/.test(lines[i])) {
      nextSectionIndex = i;
      break;
    }
  }

  // Extract existing unreleased content
  const existingUnreleased = lines.slice(unreleasedIndex + 1, nextSectionIndex);

  // Parse existing sections within [Unreleased]
  const existingSections = {};
  let currentSection = null;

  for (const line of existingUnreleased) {
    const sectionMatch = line.match(/^### (.+)/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      if (!existingSections[currentSection]) {
        existingSections[currentSection] = [];
      }
    } else if (currentSection && line.trim()) {
      existingSections[currentSection].push(line);
    }
  }

  // Merge new entries into existing sections
  for (const [section, entries] of Object.entries(groupedEntries)) {
    if (!existingSections[section]) {
      existingSections[section] = [];
    }
    existingSections[section].push(...entries);
  }

  // Rebuild the [Unreleased] section
  const newUnreleased = [];
  for (const section of SECTION_ORDER) {
    if (existingSections[section] && existingSections[section].length > 0) {
      newUnreleased.push('');
      newUnreleased.push(`### ${section}`);
      newUnreleased.push(...existingSections[section]);
    }
  }

  // Also include any sections not in SECTION_ORDER (preserve custom sections)
  for (const [section, entries] of Object.entries(existingSections)) {
    if (!SECTION_ORDER.includes(section) && entries.length > 0) {
      newUnreleased.push('');
      newUnreleased.push(`### ${section}`);
      newUnreleased.push(...entries);
    }
  }

  // Rebuild the full changelog
  const result = [
    ...lines.slice(0, unreleasedIndex + 1),
    ...newUnreleased,
    '',
    ...lines.slice(nextSectionIndex),
  ];

  return result.join('\n');
}

async function main() {
  // Read all changeset files
  let files;
  try {
    files = await readdir(CHANGESET_DIR);
  } catch {
    console.log('No .changeset directory found. Nothing to process.');
    process.exit(0);
  }

  const changesetFiles = files.filter(
    (f) => f.endsWith('.md') && f.toLowerCase() !== 'readme.md'
  );

  if (changesetFiles.length === 0) {
    console.log('No changeset files to process.');
    process.exit(0);
  }

  console.log(`Processing ${changesetFiles.length} changeset(s)...`);

  // Parse all changesets and group by category
  const groupedEntries = {};
  const processedFiles = [];

  for (const file of changesetFiles) {
    const filePath = join(CHANGESET_DIR, file);
    const content = await readFile(filePath, 'utf-8');
    const parsed = parseChangeset(content);

    if (parsed) {
      if (!groupedEntries[parsed.category]) {
        groupedEntries[parsed.category] = [];
      }
      groupedEntries[parsed.category].push(parsed.entry);
      processedFiles.push(filePath);
      console.log(`  ${file} → ${parsed.category}`);
    } else {
      console.warn(`  ${file} — skipped (could not parse)`);
    }
  }

  if (processedFiles.length === 0) {
    console.log('No valid changesets found.');
    process.exit(0);
  }

  // Update CHANGELOG.md
  const changelog = await readFile(CHANGELOG_PATH, 'utf-8');
  const updatedChangelog = updateChangelog(changelog, groupedEntries);
  await writeFile(CHANGELOG_PATH, updatedChangelog, 'utf-8');
  console.log(`Updated ${CHANGELOG_PATH}`);

  // Delete consumed changeset files
  for (const filePath of processedFiles) {
    await unlink(filePath);
    console.log(`  Deleted ${filePath}`);
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error('Error processing changesets:', err);
  process.exit(1);
});
