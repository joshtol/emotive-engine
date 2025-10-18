import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Simple file-based waitlist storage (will be replaced with Firebase later)
const WAITLIST_FILE = join(process.cwd(), 'data', 'waitlist.json');

interface WaitlistEntry {
  email: string;
  timestamp: string;
  source: string;
}

async function getWaitlist(): Promise<WaitlistEntry[]> {
  try {
    const data = await readFile(WAITLIST_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // File doesn't exist yet
    return [];
  }
}

async function saveWaitlist(entries: WaitlistEntry[]): Promise<void> {
  try {
    // Ensure data directory exists
    await mkdir(join(process.cwd(), 'data'), { recursive: true });
    await writeFile(WAITLIST_FILE, JSON.stringify(entries, null, 2));
  } catch (error) {
    console.error('Error saving waitlist:', error);
  }
}

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

    // Get current waitlist
    const waitlist = await getWaitlist();

    // Check if email already exists
    const existing = waitlist.find(entry => entry.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "You're already on the waitlist!",
        duplicate: true
      });
    }

    // Add new email
    const newEntry: WaitlistEntry = {
      email,
      timestamp: new Date().toISOString(),
      source: 'homepage'
    };

    waitlist.push(newEntry);

    // Save to file
    await saveWaitlist(waitlist);

    // Also log to console for monitoring
    console.log('New waitlist signup:', email);

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
