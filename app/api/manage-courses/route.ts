import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createAutoZoomMeeting } from '@/lib/zoom';

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
      // 1. Fetch single course details
      const { data: course, error: cErr } = await supabaseAdmin
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (cErr) throw cErr;

      // 2. Fetch Live Class
      const { data: liveClass } = await supabaseAdmin
        .from('live_classes')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // 3. Fetch Recordings
      const { data: recordings } = await supabaseAdmin
        .from('recordings')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      // 4. Fetch Tutes / Course Materials
      const { data: materials } = await supabaseAdmin
        .from('course_materials')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      // 5. Fetch Assignments with deadline
      const { data: assignments } = await supabaseAdmin
        .from('assignments')
        .select('*, assignment_submissions(count)')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      // 6. Active Student count
      const { count: studentCount } = await supabaseAdmin
        .from('course_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId)
        .eq('status', 'active');

      return NextResponse.json({
        course,
        liveClass: liveClass || null,
        recordings: recordings || [],
        materials: materials || [],
        assignments: assignments || [],
        studentCount: studentCount || 0,
      });
    }

    // Fetch all courses overview
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

      await supabaseAdmin.from('live_classes').delete().eq('course_id', courseId);
      await supabaseAdmin.from('recordings').delete().eq('course_id', courseId);
      await supabaseAdmin.from('course_materials').delete().eq('course_id', courseId);
      await supabaseAdmin.from('assignments').delete().eq('course_id', courseId);
      await supabaseAdmin.from('course_enrollments').delete().eq('course_id', courseId);

      const { error } = await supabaseAdmin.from('courses').delete().eq('id', courseId);
      if (error) throw error;

      return NextResponse.json({ success: true, message: 'පාඨමාලාව සාර්ථකව ඉවත් කරන ලදී.' });
    }

    // ACTION 3: AUTO SCHEDULE ZOOM MEETING
    if (action === 'schedule_live_class') {
      const { courseId, title, date, time } = body;
      if (!courseId || !title) {
        return NextResponse.json({ error: 'මාතෘකාව අනිවාර්යයි.' }, { status: 400 });
      }

      const startDateTime = `${date || new Date().toISOString().split('T')[0]}T${time || '19:00'}:00`;
      const zoomMeeting = await createAutoZoomMeeting(title, startDateTime);
      const secureJoinUrl = `/api/zoom/join?courseId=${courseId}&meetingId=${zoomMeeting.meetingId}`;

      await supabaseAdmin.from('live_classes').delete().eq('course_id', courseId);

      const { data, error } = await supabaseAdmin
        .from('live_classes')
        .insert([
          {
            course_id: courseId,
            title,
            date: date || new Date().toISOString().split('T')[0],
            time: time || '19:00',
            zoom_join_url: secureJoinUrl,
            meeting_id: zoomMeeting.meetingId,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ 
        success: true, 
        liveClass: data,
        isMock: zoomMeeting.isMock,
        message: zoomMeeting.isMock 
          ? 'Zoom Meeting එක සකස් විය (Simulation Mode).'
          : 'Zoom Meeting එක සජීවීව සාර්ථකව Schedule කරන ලදී!'
      });
    }

    // ACTION 4: DELETE LIVE CLASS
    if (action === 'delete_live_class') {
      const { classId } = body;
      const { error } = await supabaseAdmin.from('live_classes').delete().eq('id', classId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // ACTION 5: ADD YOUTUBE RECORDING
    if (action === 'add_recording') {
      const { courseId, title, lesson_date, duration, video_id } = body;
      if (!courseId || !title || !video_id) {
        return NextResponse.json({ error: 'මාතෘකාව සහ Video ID අනිවාර්යයි.' }, { status: 400 });
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

    // ACTION 7: ADD COURSE MATERIAL / TUTE
    if (action === 'add_material') {
      const { courseId, title, description, file_url, file_name, file_size } = body;
      if (!courseId || !title || !file_url) {
        return NextResponse.json({ error: 'මාතෘකාව සහ ගොනුව (PDF) අනිවාර්යයි.' }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from('course_materials')
        .insert([
          {
            course_id: courseId,
            title,
            description: description || '',
            file_url,
            file_name: file_name || 'Tute.pdf',
            file_size: file_size || 'PDF Document',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, material: data });
    }

    // ACTION 8: DELETE COURSE MATERIAL / TUTE
    if (action === 'delete_material') {
      const { materialId } = body;
      const { error } = await supabaseAdmin.from('course_materials').delete().eq('id', materialId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // ACTION 9: ADD ASSIGNMENT (WITH DEADLINE)
    if (action === 'add_assignment') {
      const { courseId, title, description, file_url, due_date, total_marks } = body;
      if (!courseId || !title || !due_date) {
        return NextResponse.json({ error: 'මාතෘකාව සහ අවසන් දිනය (Deadline) අනිවාර්යයි.' }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from('assignments')
        .insert([
          {
            course_id: courseId,
            title,
            description: description || '',
            file_url: file_url || null,
            due_date,
            total_marks: Number(total_marks) || 100,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, assignment: data });
    }

    // ACTION 10: DELETE ASSIGNMENT
    if (action === 'delete_assignment') {
      const { assignmentId } = body;
      const { error } = await supabaseAdmin.from('assignments').delete().eq('id', assignmentId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}