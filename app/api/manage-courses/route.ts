import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(req: Request) {
  try {
    const supabaseAdmin = getAdminClient();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (courseId) {
      // 1. Fetch single course details with its live class and recordings
      const { data: course, error: cErr } = await supabaseAdmin
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (cErr) throw cErr;

      const { data: liveClass } = await supabaseAdmin
        .from('live_classes')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: recordings } = await supabaseAdmin
        .from('recordings')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      const { count: studentCount } = await supabaseAdmin
        .from('course_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId)
        .eq('status', 'active');

      return NextResponse.json({
        course,
        liveClass: liveClass || null,
        recordings: recordings || [],
        studentCount: studentCount || 0,
      });
    }

    // 2. Fetch all courses with student counts
    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const coursesWithStats = await Promise.all(
      (courses || []).map(async (c: any) => {
        const { count: studentCount } = await supabaseAdmin
          .from('course_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', c.id)
          .eq('status', 'active');

        const { count: recCount } = await supabaseAdmin
          .from('recordings')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', c.id);

        return {
          ...c,
          studentCount: studentCount || 0,
          recordingCount: recCount || 0,
        };
      })
    );

    return NextResponse.json({ courses: coursesWithStats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getAdminClient();
    const body = await req.json();
    const { action } = body;

    // ACTION 1: CREATE NEW COURSE
    if (action === 'create_course') {
      const { title, category, type, monthly_fee, description } = body;
      if (!title) {
        return NextResponse.json({ error: 'පාඨමාලා නම අනිවාර්යයි.' }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from('courses')
        .insert([
          {
            title,
            category: category || 'General',
            type: type || 'Theory',
            monthly_fee: Number(monthly_fee) || 0,
            description: description || '',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, course: data });
    }

    // ACTION 2: DELETE COURSE
    if (action === 'delete_course') {
      const { courseId } = body;
      if (!courseId) return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });

      // Clean up linked data first
      await supabaseAdmin.from('live_classes').delete().eq('course_id', courseId);
      await supabaseAdmin.from('recordings').delete().eq('course_id', courseId);
      await supabaseAdmin.from('course_enrollments').delete().eq('course_id', courseId);

      const { error } = await supabaseAdmin.from('courses').delete().eq('id', courseId);
      if (error) throw error;

      return NextResponse.json({ success: true, message: 'පාඨමාලාව සාර්ථකව ඉවත් කරන ලදී.' });
    }

    // ACTION 3: SCHEDULE LIVE ZOOM CLASS
    if (action === 'schedule_live_class') {
      const { courseId, title, date, time, zoom_join_url } = body;
      if (!courseId || !title || !zoom_join_url) {
        return NextResponse.json({ error: 'මාතෘකාව සහ Zoom Join URL අනිවාර්යයි.' }, { status: 400 });
      }

      // Replace existing live class for this course
      await supabaseAdmin.from('live_classes').delete().eq('course_id', courseId);

      const { data, error } = await supabaseAdmin
        .from('live_classes')
        .insert([
          {
            course_id: courseId,
            title,
            date: date || new Date().toISOString().split('T')[0],
            time: time || '19:00',
            zoom_join_url,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, liveClass: data });
    }

    // ACTION 4: DELETE LIVE CLASS
    if (action === 'delete_live_class') {
      const { classId } = body;
      const { error } = await supabaseAdmin.from('live_classes').delete().eq('id', classId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // ACTION 5: ADD RECORDING
    if (action === 'add_recording') {
      const { courseId, title, lesson_date, duration, video_id } = body;
      if (!courseId || !title || !video_id) {
        return NextResponse.json({ error: 'මාතෘකාව සහ Bunny Video ID අනිවාර්යයි.' }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from('recordings')
        .insert([
          {
            course_id: courseId,
            title,
            lesson_date: lesson_date || new Date().toISOString().split('T')[0],
            duration: duration || '2h 00m',
            video_id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, recording: data });
    }

    // ACTION 6: DELETE RECORDING
    if (action === 'delete_recording') {
      const { recordingId } = body;
      const { error } = await supabaseAdmin.from('recordings').delete().eq('id', recordingId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}