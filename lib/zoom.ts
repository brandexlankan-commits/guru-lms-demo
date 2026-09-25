// Zoom Server-to-Server OAuth Token Generator & Meeting Creator

export async function getZoomAccessToken(): Promise<string | null> {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  // Placeholder හෝ හිස්ව ඇත්නම් Mock mode එකක් ලෙස සලකයි
  if (!accountId || !clientId || !clientSecret || accountId === 'placeholder') {
    return null;
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const res = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
        },
      }
    );

    if (!res.ok) {
      console.error('Zoom OAuth Failed:', await res.text());
      return null;
    }

    const data = await res.json();
    return data.access_token;
  } catch (err) {
    console.error('Zoom Token Error:', err);
    return null;
  }
}

// Create Automated Zoom Meeting
export async function createAutoZoomMeeting(topic: string, startTime: string) {
  const token = await getZoomAccessToken();

  // Zoom keys නැතිනම් Test / Simulation Meeting එකක් සාදයි
  if (!token) {
    const fakeMeetingId = Math.floor(10000000000 + Math.random() * 90000000000).toString();
    return {
      meetingId: fakeMeetingId,
      passcode: '123456',
      zoom_join_url: `https://zoom.us/j/${fakeMeetingId}?pwd=simulation`,
      isMock: true,
    };
  }

  // Real Zoom API Call
  const res = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      type: 2, // Scheduled Meeting
      start_time: startTime, // ISO format
      duration: 150, // 2.5 hours
      timezone: 'Asia/Colombo',
      settings: {
        host_video: true,
        participant_video: false,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        approval_type: 0, // Automatically Approve Registrants for unique join links
        registration_type: 1,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Zoom Meeting සෑදීම අසාර්ථක විය.');
  }

  return {
    meetingId: data.id.toString(),
    passcode: data.password || '',
    zoom_join_url: data.join_url,
    isMock: false,
  };
}

// Generate Single-Use Registrant Link for Student
export async function getStudentPersonalZoomLink(meetingId: string, studentName: string, studentEmail: string) {
  const token = await getZoomAccessToken();

  if (!token) {
    // Mock Mode fallback
    return `https://zoom.us/j/${meetingId}`;
  }

  const res = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}/registrants`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      first_name: studentName,
      email: studentEmail,
    }),
  });

  const data = await res.json();
  if (res.ok && data.join_url) {
    return data.join_url; // Personal one-time link!
  }

  return `https://zoom.us/j/${meetingId}`;
}