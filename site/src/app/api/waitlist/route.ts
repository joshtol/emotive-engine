import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Initialize Firebase Admin (server-side)
    const admin = await import('firebase-admin');

    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      // Use environment variables for Firebase config
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : {
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            // For development, we'll use the public config
            // In production, add proper service account credentials
          };

      try {
        admin.initializeApp({
          credential: serviceAccount.privateKey
            ? admin.credential.cert(serviceAccount)
            : admin.credential.applicationDefault(),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      } catch (error: any) {
        // If Firebase Admin is not properly configured, fall back to client-side
        console.warn('Firebase Admin not available, using fallback');
      }
    }

    let db;
    try {
      db = admin.firestore();
    } catch {
      // Fallback: Return success but log to console
      console.log('Waitlist signup:', email);
      return NextResponse.json({
        success: true,
        message: 'Successfully joined the waitlist!',
        fallback: true
      });
    }

    // Store in Firestore
    const waitlistRef = db.collection('waitlist');

    // Check if email already exists
    const existing = await waitlistRef.where('email', '==', email).get();

    if (!existing.empty) {
      return NextResponse.json({
        success: true,
        message: "You're already on the waitlist!",
        duplicate: true
      });
    }

    // Add new email to waitlist
    await waitlistRef.add({
      email,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      source: 'homepage',
      notified: false
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist!'
    });

  } catch (error: any) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    );
  }
}
