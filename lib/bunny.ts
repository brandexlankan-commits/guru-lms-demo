// Bunny Stream Cloud-to-Cloud Video Fetch API

export async function uploadZoomRecordingToBunny(
  title: string,
  zoomDownloadUrl: string
): Promise<{ videoId: string; isMock: boolean }> {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const apiKey = process.env.BUNNY_STREAM_API_KEY;

  // Placeholder හෝ keys නොමැති නම් Test Mode එකක් ලෙස සලකයි
  if (!libraryId || !apiKey || libraryId === 'placeholder') {
    const fakeVideoId = `bunny_sim_${Math.random().toString(36).substring(2, 10)}`;
    return { videoId: fakeVideoId, isMock: true };
  }

  // 1. Create a video object in Bunny Stream
  const createRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
    method: 'POST',
    headers: {
      AccessKey: apiKey,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  const createData = await createRes.json();
  if (!createRes.ok || !createData.guid) {
    throw new Error(`Bunny video creation failed: ${createData.message || createRes.statusText}`);
  }

  const videoId = createData.guid;

  // 2. Instruct Bunny Stream to FETCH video directly from Zoom Cloud URL
  const fetchRes = await fetch(
    `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}/fetch`,
    {
      method: 'POST',
      headers: {
        AccessKey: apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({ url: zoomDownloadUrl }),
    }
  );

  const fetchData = await fetchRes.json();
  if (!fetchRes.ok || !fetchData.success) {
    console.error('Bunny fetch triggered with warning:', fetchData);
  }

  return { videoId, isMock: false };
}