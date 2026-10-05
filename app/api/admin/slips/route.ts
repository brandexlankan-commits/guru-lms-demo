import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET: Fetch all slips with student metadata and course titles
export async function GET() {
  try {
    const supabaseAdmin = getAdminClient();

    // 1. Fetch all slips
    const { data: slipsData, error: slipsErr } = await supabaseAdmin
      .from('slips')
      .select('*')
      .order('created_at', { ascending: false });

    if (slipsErr) throw slipsErr;

    // 2. Fetch all courses for mapping title
    const { data: coursesData } = await supabaseAdmin
      .from('courses')
      .select('id, title');

    const courseMap = new Map();
    (coursesData || []).forEach((c: any) => {
      courseMap.set(c.id.toString(), c.title);
    });

    // 3. Fetch all Auth users for student metadata
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const userMap = new Map();
    (users || []).forEach((u: any) => {
      userMap.set(u.id, u);
    });

    // 4. Map slips with student name, username, phone and course name
    const slips = (slipsData || []).map((s: any) => {
      const u = userMap.get(s.student_id);
      return {
        id: s.id,
        student_id: s.student_id,
        course_id: s.course_id,
        amount: s.amount || 0,
        slip_url: s.slip_url,
        status: s.status || 'pending',
        created_at: s.created_at,
        studentName: u?.user_metadata?.full_name || 'ශිෂ්‍යයා',
        studentUsername: u?.user_metadata?.username || u?.email?.split('@')[0] || 'student',
        studentPhone: u?.user_metadata?.phone || '',
        course_name: courseMap.get(s.course_id?.toString()) || 'පන්තිය',
      };
    });

    const total = slips.length;
    const pending = slips.filter((s: any) => s.status === 'pending').length;
    const approved = slips.filter((s: any) => s.status === 'approved').length;
    const rejected = slips.filter((s: any) => s.status === 'rejected').length;

    return NextResponse.json({
      stats: {
        total,
        pending,
        approved,
        rejected,
      },
      slips,
    });
  } catch (err: any) {
    console.error('Error fetching slips:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Approve or Reject Slips
export async function POST(req: Request) {
  try {
    const supabaseAdmin = getAdminClient();
    const body = await req.json();
    const { action, slipId, studentId, courseId } = body;

    if (!slipId) {
      return NextResponse.json({ error: 'Slip ID is required' }, { status: 400 });
    }

    if (action === 'approve') {
      // 1. Update slip status to approved
      const { error: slipErr } = await supabaseAdmin
        .from('slips')
        .update({ status: 'approved' })
        .eq('id', slipId);

      if (slipErr) throw slipErr;

      // 2. Extend student course access for 30 days
      const newValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      if (studentId && courseId) {
        // Check existing enrollment
        const { data: existingEnroll } = await supabaseAdmin
          .from('course_enrollments')
          .select('id')
          .eq('user_id', studentId)
          .eq('course_id', courseId)
          .maybeSingle();

        if (existingEnroll) {
          await supabaseAdmin
            .from('course_enrollments')
            .update({ valid_until: newValidUntil, status: 'active' })
            .eq('id', existingEnroll.id);
        } else {
          await supabaseAdmin
            .from('course_enrollments')
            .insert([
              {
                user_id: studentId,
                course_id: courseId,
                status: 'active',
                valid_until: newValidUntil,
              },
            ]);
        }
      }

      return NextResponse.json({ success: true, message: 'රිසිට්පත සාර්ථකව අනුමත කරන ලදී!' });
    }

    if (action === 'reject') {
      const { error: rejectErr } = await supabaseAdmin
        .from('slips')
        .update({ status: 'rejected' })
        .eq('id', slipId);

      if (rejectErr) throw rejectErr;

      return NextResponse.json({ success: true, message: 'රිසිට්පත ප්‍රතික්ෂේප කරන ලදී.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Error handling slip action:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}