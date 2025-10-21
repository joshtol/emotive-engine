import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message, page } = body

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // TODO: Replace with your actual email service configuration
    // For now, we'll log to console and return success
    // You can integrate with services like SendGrid, Resend, AWS SES, etc.

    const feedbackData = {
      page: page || 'Unknown',
      name: name || 'Anonymous',
      email: email || 'No email provided',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'Unknown',
    }

    console.log('📧 New Feedback Received:', JSON.stringify(feedbackData, null, 2))

    // Example: Send email using a service
    // await sendEmail({
    //   to: 'feedback@yourdomain.com',
    //   subject: `Cherokee Page Feedback: ${page}`,
    //   text: `
    //     New feedback received:
    //
    //     Page: ${feedbackData.page}
    //     Name: ${feedbackData.name}
    //     Email: ${feedbackData.email}
    //
    //     Message:
    //     ${feedbackData.message}
    //
    //     Submitted: ${feedbackData.timestamp}
    //   `,
    // })

    return NextResponse.json(
      {
        success: true,
        message: 'Feedback received successfully'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error processing feedback:', error)
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    )
  }
}
