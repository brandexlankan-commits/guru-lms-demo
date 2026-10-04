import { NextResponse } from 'next/server';
import { getZoomAccessToken } from '@/lib/zoom';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get('meetingId');

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID is missing' }, { status: 400 });
    }

    const accessToken = await getZoomAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: 'Zoom credentials are not configured' }, { status: 500 });
    }

    // Zoom API එකෙන් Host කෙනෙකු ලෙස Start කළ හැකි start_url (ZAK Token) එක ලබාගැනීම
    const zoomRes = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!zoomRes.ok) {
      const err = await zoomRes.json();
      throw new Error(err.message || 'Zoom meeting details ලබාගත නොහැකි විය.');
    }

    const meetingData = await zoomRes.json();

    // 1. Host Start URL එක තිබේ නම් ගුරුවරයාව Host ලෙස Zoom එකට Redirect කිරීම
    if (meetingData.start_url) {
      return NextResponse.redirect(meetingData.start_url);
    }

    // 2. Fallback
    if (meetingData.join_url) {
      return NextResponse.redirect(meetingData.join_url);
    }

    return NextResponse.redirect(`https://zoom.us/j/${meetingId}`);
  } catch (error: any) {
    console.error('Error in /api/zoom/start gateway:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}