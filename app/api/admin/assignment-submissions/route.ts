import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET: Fetch all student submissions for a specific assignment
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // 1. Fetch submissions for this assignment
    const { data: subsData, error: subsErr } = await supabaseAdmin
      .from('assignment_submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });

    if (subsErr) throw subsErr;

    // 2. Fetch auth users to get full_name, username, and phone
    const { data: { users }, error: usersErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (usersErr) throw usersErr;

    const userMap = new Map();
    (users || []).forEach((u: any) => {
      userMap.set(u.id, u);
    });

    const submissions = (subsData || []).map((s: any) => {
      const u = userMap.get(s.student_id);
      return {
        id: s.id,
        assignment_id: s.assignment_id,
        student_id: s.student_id,
        submission_file_url: s.submission_file_url,
        status: s.status || 'submitted',
        marks: s.marks,
        feedback: s.feedback || '',
        submitted_at: s.submitted_at,
        graded_at: s.graded_at,
        studentName: u?.user_metadata?.full_name || 'ශිෂ්‍යයා',
        studentUsername: u?.user_metadata?.username || u?.email?.split('@')[0] || 'student',
        studentPhone: u?.user_metadata?.phone || '',
      };
    });

    return NextResponse.json({ submissions });
  } catch (err: any) {
    console.error('Error fetching submissions:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Save marks and feedback for a student's submission
export async function POST(req: Request) {
  try {
    const supabaseAdmin = getAdminClient();
    const body = await req.json();
    const { action, submissionId, marks, feedback } = body;

    if (action === 'grade_submission') {
      if (!submissionId) {
        return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
      }

      const numericMarks = marks !== '' && marks !== null && marks !== undefined ? Number(marks) : null;

      const { data, error } = await supabaseAdmin
        .from('assignment_submissions')
        .update({
          marks: numericMarks,
          feedback: feedback || null,
          status: 'graded',
          graded_at: new Date().toISOString(),
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, message: 'ලකුණු සාර්ථකව සුරකින ලදී!', submission: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Error grading submission:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}