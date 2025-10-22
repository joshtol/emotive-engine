import { NextRequest, NextResponse } from 'next/server'

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

    // TODO: Replace with your actual email service or database
    // For now, we'll log to console and return success
    // You can integrate with services like:
    // - Mailchimp API
    // - SendGrid Lists
    // - ConvertKit
    // - Your own database (Supabase, Firebase, etc.)

    const waitlistData = {
      email: email.toLowerCase().trim(),
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      referrer: request.headers.get('referer') || 'Direct',
    }

    console.log('📬 New Waitlist Signup:', JSON.stringify(waitlistData, null, 2))

    // Example: Add to email service
    // await addToMailingList({
    //   email: waitlistData.email,
    //   tags: ['emotive-engine-waitlist'],
    //   source: 'website-homepage',
    // })

    // Example: Send confirmation email
    // await sendEmail({
    //   to: waitlistData.email,
    //   subject: 'Welcome to Emotive Engine Waitlist',
    //   html: `
    //     <h2>Thanks for joining!</h2>
    //     <p>You're on the waitlist for Emotive Engine.</p>
    //     <p>We'll notify you when we launch.</p>
    //   `,
    // })

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
