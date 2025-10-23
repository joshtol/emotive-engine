import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already exists
    const waitlistRef = adminDb.collection('waitlist')
    const querySnapshot = await waitlistRef.where('email', '==', normalizedEmail).get()

    if (!querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Email already on waitlist' },
        { status: 409 }
      )
    }

    // Add to Firestore
    const waitlistData = {
      email: normalizedEmail,
      timestamp: FieldValue.serverTimestamp(),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      referrer: request.headers.get('referer') || 'Direct',
      source: 'website-homepage',
    }

    await waitlistRef.add(waitlistData)

    console.log('📬 New Waitlist Signup:', normalizedEmail)

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully joined the waitlist!'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error processing waitlist signup:', error)
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}
