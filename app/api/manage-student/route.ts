import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Get enrollments for this course
    const { data: enrollments, error: enrollError } = await supabaseAdmin
      .from('course_enrollments')
      .select('id, user_id, student_id, course_id, status, valid_until, created_at')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (enrollError) throw enrollError;

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ students: [] });
    }

    // 2. Extract user IDs
    const userIds = enrollments.map((e: any) => e.user_id || e.student_id).filter(Boolean);

    // 3. Fetch matching profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, username, phone, current_device_id')
      .in('id', userIds);

    if (profileError) throw profileError;

    // 4. Combine data (prof ට : any දමා TypeScript error එක විසඳා ඇත)
    const combined = enrollments.map((enroll: any) => {
      const uId = enroll.user_id || enroll.student_id;
      const prof: any = profiles?.find((p: any) => p.id === uId) || {};
      return {
        enrollmentId: enroll.id,
        userId: uId,
        courseId: enroll.course_id,
        status: enroll.status,
        validUntil: enroll.valid_until,
        fullName: prof.full_name || 'නම නොදනී',
        username: prof.username || 'user',
        phone: prof.phone || '',
        deviceId: prof.current_device_id || null,
      };
    });

    return NextResponse.json({ students: combined });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action, userId, courseId, enrollmentId } = await req.json();

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // ACTION 1: EXTEND ACCESS (+30 DAYS)
    if (action === 'extend_access') {
      const now = new Date();
      let newDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Check current valid_until date
      const { data: currentEnroll } = await supabaseAdmin
        .from('course_enrollments')
        .select('valid_until')
        .match({ course_id: courseId, ...(enrollmentId ? { id: enrollmentId } : { user_id: userId }) })
        .maybeSingle();

      if (currentEnroll?.valid_until) {
        const curr = new Date(currentEnroll.valid_until);
        if (curr > now) {
          // If not expired yet, add 30 days to existing date
          newDate = new Date(curr.getTime() + 30 * 24 * 60 * 60 * 1000);
        }
      }

      const updateFilter = enrollmentId ? { id: enrollmentId } : { course_id: courseId, user_id: userId };

      const { error: updateError } = await supabaseAdmin
        .from('course_enrollments')
        .update({
          valid_until: newDate.toISOString(),
          status: 'active',
        })
        .match(updateFilter);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        validUntil: newDate.toISOString(),
        message: 'පන්ති වලංගු කාලය තවත් දින 30 කට දීර්ඝ කරන ලදී!',
      });
    }

    // ACTION 2: RESET DEVICE (UNLOCK)
    if (action === 'reset_device') {
      const { error: resetError } = await supabaseAdmin
        .from('profiles')
        .update({ current_device_id: null })
        .eq('id', userId);

      if (resetError) throw resetError;

      return NextResponse.json({
        success: true,
        message: 'උපාංගය සාර්ථකව Reset කරන ලදී! ශිෂ්‍යයාට නව උපාංගයකින් Login විය හැක.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}