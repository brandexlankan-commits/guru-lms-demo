import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { uploadZoomRecordingToBunny } from '@/lib/bunny';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    const secretToken = process.env.ZOOM_WEBHOOK_SECRET_TOKEN || '';

    // ==============================================================
    // 1. ZOOM WEBHOOK CRC CHALLENGE (URL VALIDATION)
    // ==============================================================
    if (body.event === 'endpoint.url_validation') {
      const plainToken = body.payload?.plainToken;
      const encryptedToken = crypto
        .createHmac('sha256', secretToken)
        .update(plainToken)
        .digest('hex');

      return NextResponse.json({
        plainToken,
        encryptedToken,
      }, { status: 200 });
    }

    // ==============================================================
    // 2. ZOOM RECORDING COMPLETED EVENT
    // ==============================================================
    if (body.event === 'recording.completed') {
      const payload = body.payload?.object;
      if (!payload) {
        return NextResponse.json({ message: 'No payload' }, { status: 400 });
      }

      const meetingId = payload.id?.toString();
      const topic = payload.topic || 'Class Lesson Recording';
      const durationMinutes = payload.duration || 120;
      const hours = Math.floor(durationMinutes / 60);
      const mins = durationMinutes % 60;
      const durationFormatted = `${hours > 0 ? `${hours}h ` : ''}${mins}m`;

      // Filter the main MP4 video file from Zoom recording files
      const mp4File = payload.recording_files?.find(
        (f: any) => f.file_type === 'MP4' || f.file_extension === 'MP4'
      );

      const downloadUrl = mp4File?.download_url || payload.share_url;

      if (!downloadUrl) {
        console.error('No download URL found in Zoom recording payload');
        return NextResponse.json({ error: 'Download URL missing' }, { status: 400 });
      }

      const supabaseAdmin = getAdminClient();

      // Find which course this meeting belongs to using meeting_id
      const { data: liveClass } = await supabaseAdmin
        .from('live_classes')
        .select('course_id, title')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let targetCourseId = liveClass?.course_id;

      // Fallback: If not found by meeting_id, match by active courses
      if (!targetCourseId) {
        const { data: firstCourse } = await supabaseAdmin
          .from('courses')
          .select('id')
          .limit(1)
          .single();
        targetCourseId = firstCourse?.id;
      }

      if (!targetCourseId) {
        return NextResponse.json({ error: 'Matching course not found' }, { status: 404 });
      }

      // Upload / Fetch into Bunny Stream Cloud
      const recordingTitle = `${topic} (${new Date().toLocaleDateString('si-LK')})`;
      const { videoId } = await uploadZoomRecordingToBunny(recordingTitle, downloadUrl);

      // Save to Supabase `recordings` table
      const todayDate = new Date().toISOString().split('T')[0];
      const { data: newRecording, error: insertErr } = await supabaseAdmin
        .from('recordings')
        .insert([
          {
            course_id: targetCourseId,
            title: topic,
            lesson_date: todayDate,
            duration: durationFormatted,
            video_id: videoId,
          },
        ])
        .select()
        .single();

      if (insertErr) throw insertErr;

      return NextResponse.json({
        success: true,
        message: 'Recording auto-processed and added to course playlist successfully!',
        recording: newRecording,
      });
    }

    return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
  } catch (error: any) {
    console.error('Zoom Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}