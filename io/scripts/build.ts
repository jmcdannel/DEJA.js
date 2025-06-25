import * as fs from 'fs-extra';
import * as path from 'path';

async function build() {
  try {
    // Ensure the dist directory exists
    await fs.ensureDir('dist');

    // Copy src to dist
    await fs.copy('./src/', './dist/');

    console.log('Build completed successfully! Files copied from src to dist.');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Run the build
build();