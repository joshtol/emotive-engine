import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin (server-side only)
if (!getApps().length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin credentials. Check NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.')
  }

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })
}

export const adminDb = getFirestore()
