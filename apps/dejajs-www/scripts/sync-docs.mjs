import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let DEJA_DOCS_PATH = process.env.DEJA_DOCS_PATH;
if (!DEJA_DOCS_PATH) {
  DEJA_DOCS_PATH = path.resolve(__dirname, '../../../docs');
}
const TARGET_DIR = path.resolve(__dirname, '../content/docs');

async function syncDocs() {
  console.log(`Syncing docs from ${DEJA_DOCS_PATH} to ${TARGET_DIR}...`);

  // Check if source exists — skip gracefully if docs directory not found
  if (!fs.existsSync(DEJA_DOCS_PATH)) {
    console.log(`Source docs directory not found: ${DEJA_DOCS_PATH} — skipping sync.`);
    return;
  }

  // Clean target directory
  if (fs.existsSync(TARGET_DIR)) {
    fs.rmSync(TARGET_DIR, { recursive: true, force: true });
    console.log('Cleaned target directory.');
  }

  // Create target directory
  fs.mkdirSync(TARGET_DIR, { recursive: true });

  // Recursive copy
  const copyFiles = (src, dest) => {
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyFiles(srcPath, destPath);
      } else if (entry.name.endsWith('.mdx')) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };

  copyFiles(DEJA_DOCS_PATH, TARGET_DIR);
  console.log('Docs synced successfully.');
}

syncDocs().catch(err => {
  console.error('Failed to sync docs:', err);
  process.exit(1);
});
