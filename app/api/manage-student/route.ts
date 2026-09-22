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
      .select('*')
      .eq('course_id', courseId);

    if (enrollError) throw enrollError;

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ students: [] });
    }

    // 2. Extract user IDs
    const userIds = enrollments
      .map((e: any) => e.user_id || e.student_id)
      .filter(Boolean);

    if (userIds.length === 0) {
      return NextResponse.json({ students: [] });
    }

    // 3. Fetch matching profiles from database
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('id', userIds);

    // 4. Fetch auth users to get full_name, username, phone guaranteed from metadata
    const authUsersResults = await Promise.all(
      userIds.map((uId: string) => supabaseAdmin.auth.admin.getUserById(uId))
    );

    const authUsersMap = new Map();
    authUsersResults.forEach((res) => {
      if (res.data?.user) {
        authUsersMap.set(res.data.user.id, res.data.user);
      }
    });

    // 5. Combine data accurately
    const combined = enrollments.map((enroll: any) => {
      const uId = enroll.user_id || enroll.student_id;
      const prof: any = profiles?.find((p: any) => p.id === uId) || {};
      const authUser = authUsersMap.get(uId);

      const fullName =
        prof.full_name ||
        authUser?.user_metadata?.full_name ||
        authUser?.user_metadata?.name ||
        'නම නොදනී';

      const username =
        prof.username ||
        authUser?.user_metadata?.username ||
        authUser?.email?.split('@')[0] ||
        'user';

      const phone =
        prof.phone ||
        authUser?.user_metadata?.phone ||
        '';

      const deviceId = prof.current_device_id || null;

      return {
        enrollmentId: enroll.id,
        userId: uId,
        courseId: enroll.course_id,
        status: enroll.status || 'active',
        validUntil: enroll.valid_until || null,
        fullName,
        username,
        phone,
        deviceId,
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