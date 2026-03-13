// scripts/migrate-users-to-plans.ts
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import 'dotenv/config'

const serviceAccount = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

initializeApp({ credential: cert(serviceAccount) })

const db = getFirestore()
const auth = getAuth()

async function migrate() {
  console.log('Starting user migration to plans...')
  let created = 0
  let skipped = 0
  let errors = 0
  let nextPageToken: string | undefined

  do {
    const listResult = await auth.listUsers(1000, nextPageToken)

    for (const user of listResult.users) {
      try {
        const userDoc = await db.doc(`users/${user.uid}`).get()
        if (userDoc.exists) {
          skipped++
          continue
        }

        await db.doc(`users/${user.uid}`).set({
          email: user.email ?? '',
          displayName: user.displayName ?? null,
          createdAt: FieldValue.serverTimestamp(),
          subscription: {
            plan: 'hobbyist',
            status: 'active',
            billingCycle: null,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            trialEndsAt: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            updatedAt: FieldValue.serverTimestamp(),
          },
        })
        created++
      } catch (err) {
        errors++
        console.error(`Failed to migrate user ${user.uid}:`, err)
      }
    }

    nextPageToken = listResult.pageToken
  } while (nextPageToken)

  console.log(`Migration complete: ${created} created, ${skipped} skipped, ${errors} errors`)
}

migrate().catch(console.error)
