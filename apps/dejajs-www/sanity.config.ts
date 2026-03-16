import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemaTypes'
import { structure } from './sanity/structure'

export default defineConfig({
  name: 'dejajs',
  title: 'DEJA.js',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  plugins: [
    structureTool({ structure }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})
