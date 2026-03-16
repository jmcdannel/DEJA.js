import { createClient, type SanityClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

export const client: SanityClient | null =
  projectId && dataset
    ? createClient({
        projectId,
        dataset,
        apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-03-01',
        useCdn: false,
      })
    : null
