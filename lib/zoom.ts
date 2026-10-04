import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Get dynamic credentials from Database first, fallback to Environment variables
export async function getZoomCredentials() {
  const supabaseAdmin = getAdminClient();
  const { data } = await supabaseAdmin
    .from('zoom_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  const accountId = data?.account_id?.trim() || process.env.ZOOM_ACCOUNT_ID?.trim();
  const clientId = data?.client_id?.trim() || process.env.ZOOM_CLIENT_ID?.trim();
  const clientSecret = data?.client_secret?.trim() || process.env.ZOOM_CLIENT_SECRET?.trim();

  return { accountId, clientId, clientSecret };
}

// Fetch Zoom Server-to-Server Access Token
export async function getZoomAccessToken() {
  const { accountId, clientId, clientSecret } = await getZoomCredentials();

  if (!accountId || !clientId || !clientSecret) {
    return null;
  }

  const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`;
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authHeader}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Zoom OAuth Error:', errText);
    throw new Error('Zoom Credentials වැරදියි හෝ Token ලබාගැනීමට නොහැකි විය.');
  }

  const data = await res.json();
  return data.access_token;
}

// Auto Create Zoom Meeting
export async function createAutoZoomMeeting(topic: string, startDateTime: string) {
  try {
    const accessToken = await getZoomAccessToken();

    if (!accessToken) {
      console.warn('No active Zoom credentials configured. Using Simulation fallback.');
      return {
        meetingId: Math.floor(10000000000 + Math.random() * 90000000000).toString(),
        joinUrl: 'https://zoom.us/j/mock-meeting-id',
        isMock: true,
      };
    }

    // Call official Zoom API to create meeting
    const res = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        type: 2, // Scheduled meeting
        start_time: startDateTime,
        duration: 150, // 2.5 hours
        timezone: 'Asia/Colombo',
        settings: {
          host_video: true,
          participant_video: false,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Zoom meeting create කිරීම අසාර්ථක විය.');
    }

    const meeting = await res.json();
    return {
      meetingId: meeting.id.toString(),
      joinUrl: meeting.join_url,
      isMock: false,
    };
  } catch (error: any) {
    console.error('Create Meeting Error:', error);
    throw error;
  }
}