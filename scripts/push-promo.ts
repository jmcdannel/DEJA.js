/**
 * Push a promotion to both Firestore and Sanity.
 *
 * Usage:
 *   pnpm promo:push promotions/launch-support.json
 *   pnpm promo:deactivate launch-support
 *
 * Required env vars:
 *   - Firebase Admin: VITE_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 *   - Sanity: SANITY_API_TOKEN, NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as dotenv from 'dotenv'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { createClient } from '@sanity/client'

// ─── Firebase Admin Init (self-contained, no workspace import) ──
dotenv.config()

const firebaseApp = initializeApp({
  credential: cert({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
})
const db = getFirestore(firebaseApp)

// ─── Sanity Client ──────────────────────────────────────
const sanityToken = process.env.SANITY_API_TOKEN
const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'c6pxffpo'
const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

let sanityClient: ReturnType<typeof createClient> | null = null
if (sanityToken) {
  sanityClient = createClient({
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: '2026-03-01',
    useCdn: false,
    token: sanityToken,
  })
}

// ─── Helpers ────────────────────────────────────────────

function parseDate(value: string | null): Timestamp | null {
  if (!value) return null
  return Timestamp.fromDate(new Date(value))
}

// ─── Deactivate Mode ────────────────────────────────────

async function deactivate(slug: string) {
  console.log(`Deactivating promotion: ${slug}`)

  // Firestore
  const ref = db.collection('promotions').doc(slug)
  const doc = await ref.get()
  if (doc.exists) {
    await ref.update({ active: false, updatedAt: Timestamp.now() })
    console.log(`  [ok] Firestore: deactivated`)
  } else {
    console.log(`  [skip] Firestore: document not found`)
  }

  // Sanity
  if (sanityClient) {
    const sanityDoc = await sanityClient.fetch(
      `*[_type == "promotion" && slug == $slug][0]{ _id }`,
      { slug },
    )
    if (sanityDoc) {
      await sanityClient.patch(sanityDoc._id).set({ active: false }).commit()
      console.log(`  [ok] Sanity: deactivated`)
    } else {
      console.log(`  [skip] Sanity: document not found`)
    }
  } else {
    console.log(`  [skip] Sanity: no SANITY_API_TOKEN`)
  }

  console.log('Done!')
}

// ─── Push Mode ──────────────────────────────────────────

async function push(filePath: string) {
  const absPath = resolve(filePath)
  const raw = readFileSync(absPath, 'utf-8')
  const promo = JSON.parse(raw)

  // Validate required fields
  const required = ['slug', 'title', 'body', 'variant', 'slots', 'ctas']
  for (const field of required) {
    if (!(field in promo)) {
      console.error(`ERROR: Missing required field "${field}" in ${filePath}`)
      process.exit(1)
    }
  }

  console.log(`Pushing promotion: ${promo.slug}`)

  // ── Firestore ──
  const existingDoc = await db.collection('promotions').doc(promo.slug).get()
  const firestoreDoc = {
    ...promo,
    startDate: parseDate(promo.startDate),
    endDate: parseDate(promo.endDate),
    active: promo.active ?? true,
    updatedAt: Timestamp.now(),
    ...(existingDoc.exists ? {} : { createdAt: Timestamp.now() }),
  }
  await db.collection('promotions').doc(promo.slug).set(firestoreDoc, { merge: true })
  console.log(`  [ok] Firestore: promotions/${promo.slug}`)

  // ── Sanity ──
  if (sanityClient) {
    const sanityDoc = {
      _id: `promotion-${promo.slug}`,
      _type: 'promotion' as const,
      slug: promo.slug,
      title: promo.title,
      body: promo.body,
      icon: promo.icon ?? null,
      variant: promo.variant,
      active: promo.active ?? true,
      startDate: promo.startDate ?? null,
      endDate: promo.endDate ?? null,
      slots: promo.slots,
      ctas: promo.ctas.map((cta: { label: string; url: string; style: string }, i: number) => ({
        _key: `cta-${i}`,
        ...cta,
      })),
    }
    await sanityClient.createOrReplace(sanityDoc)
    console.log(`  [ok] Sanity: promotion-${promo.slug}`)
  } else {
    console.log(`  [skip] Sanity: no SANITY_API_TOKEN (set SANITY_API_TOKEN to push to Sanity)`)
  }

  console.log('Done!')
}

// ─── CLI Entry ──────────────────────────────────────────

const args = process.argv.slice(2)

if (args.includes('--deactivate')) {
  const slug = args.find((a) => !a.startsWith('--'))
  if (!slug) {
    console.error('Usage: pnpm promo:deactivate <slug>')
    process.exit(1)
  }
  deactivate(slug).catch((err) => {
    console.error('Failed:', err)
    process.exit(1)
  })
} else {
  const filePath = args[0]
  if (!filePath) {
    console.error('Usage: pnpm promo:push <path-to-json>')
    process.exit(1)
  }
  push(filePath).catch((err) => {
    console.error('Failed:', err)
    process.exit(1)
  })
}
