import { NextResponse } from 'next/server';
import { getZoomAccessToken } from '@/lib/zoom';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get('meetingId');
    const courseId = searchParams.get('courseId');

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID is missing' }, { status: 400 });
    }

    // 1. Zoom API හරහා Passcode එක සහිත නිල Join URL එක ලබාගැනීම
    try {
      const accessToken = await getZoomAccessToken();
      if (accessToken) {
        const zoomRes = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: 'no-store',
        });

        if (zoomRes.ok) {
          const meetingData = await zoomRes.json();
          if (meetingData.join_url) {
            // Passcode එක සහිත සැබෑ Zoom Meeting එකට කෙලින්ම Redirect කිරීම
            return NextResponse.redirect(meetingData.join_url);
          }
        }
      }
    } catch (apiErr) {
      console.warn('Zoom API fetch error in gateway:', apiErr);
    }

    // 2. Fallback: Direct meeting link
    return NextResponse.redirect(`https://zoom.us/j/${meetingId}`);
  } catch (error: any) {
    console.error('Error in /api/zoom/join gateway:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}