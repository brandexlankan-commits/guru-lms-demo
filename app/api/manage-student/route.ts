import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const MONTH_NAMES_ENGLISH = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// GET: Fetch students with monthly payment status & automatic tracking
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // 1. Get enrollments for this course
    const { data: enrollments, error: enrollErr } = await supabaseAdmin
      .from('course_enrollments')
      .select('id, user_id, status, valid_until')
      .eq('course_id', courseId);

    if (enrollErr) throw enrollErr;

    // 2. Get user metadata from Supabase Auth
    const { data: { users }, error: usersErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (usersErr) throw usersErr;

    const usersMap = new Map();
    (users || []).forEach((u: any) => {
      usersMap.set(u.id, u);
    });

    const now = new Date();
    const currentMonthIdx = now.getMonth();
    const currentYear = now.getFullYear();
    const currentMonthName = MONTH_NAMES_ENGLISH[currentMonthIdx];
    const nextMonthName = MONTH_NAMES_ENGLISH[(currentMonthIdx + 1) % 12];

    const students = (enrollments || []).map((e: any) => {
      const u = usersMap.get(e.user_id);
      const validUntilDate = e.valid_until ? new Date(e.valid_until) : null;
      const isManuallySuspended = e.status === 'inactive' || e.status === 'suspended';

      let isPaidForCurrentMonth = false;
      let monthStatusText = '';

      if (isManuallySuspended) {
        isPaidForCurrentMonth = false;
        monthStatusText = 'Access Suspended';
      } else if (validUntilDate) {
        const validYear = validUntilDate.getFullYear();
        const validMonthIdx = validUntilDate.getMonth();
        const validMonthName = MONTH_NAMES_ENGLISH[validMonthIdx];

        if (validYear > currentYear || (validYear === currentYear && validMonthIdx > currentMonthIdx)) {
          isPaidForCurrentMonth = true;
          monthStatusText = `Active through ${validMonthName}`;
        } else if (validYear === currentYear && validMonthIdx === currentMonthIdx) {
          isPaidForCurrentMonth = true;
          monthStatusText = `Active for ${currentMonthName}`;
        } else {
          isPaidForCurrentMonth = false;
          monthStatusText = `Unpaid for ${currentMonthName}`;
        }
      } else {
        isPaidForCurrentMonth = false;
        monthStatusText = `Unpaid for ${currentMonthName}`;
      }

      return {
        enrollmentId: e.id,
        userId: e.user_id,
        fullName: u?.user_metadata?.full_name || 'Student',
        username: u?.user_metadata?.username || u?.email?.split('@')[0] || 'student',
        phone: u?.user_metadata?.phone || '',
        password: u?.user_metadata?.initial_password || u?.user_metadata?.password || 'Mano#2026',
        deviceId: u?.user_metadata?.device_id || null,
        validUntil: e.valid_until,
        status: e.status || 'active',
        isPaidForCurrentMonth,
        monthStatusText,
        currentMonthName,
        nextMonthName,
      };
    });

    return NextResponse.json({ 
      students,
      currentMonthName,
      nextMonthName,
    });
  } catch (err: any) {
    console.error('Error fetching students:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Flexible Access Controls
export async function POST(req: Request) {
  try {
    const supabaseAdmin = getAdminClient();
    const body = await req.json();
    const { action, userId, enrollmentId, targetMonth, newStatus } = body;

    // 1. Activate Calendar Month
    if (action === 'activate_month') {
      const now = new Date();
      let targetDate: Date;

      if (targetMonth === 'next_month') {
        targetDate = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999);
      } else {
        targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }

      const newValidUntil = targetDate.toISOString();

      const { error } = await supabaseAdmin
        .from('course_enrollments')
        .update({ valid_until: newValidUntil, status: 'active' })
        .eq('id', enrollmentId);

      if (error) throw error;
      return NextResponse.json({ success: true, validUntil: newValidUntil, status: 'active' });
    }

    // 2. Toggle Status (Active <-> Inactive)
    if (action === 'toggle_status') {
      const statusToSet = newStatus === 'active' ? 'active' : 'inactive';
      const { error } = await supabaseAdmin
        .from('course_enrollments')
        .update({ status: statusToSet })
        .eq('id', enrollmentId);

      if (error) throw error;
      return NextResponse.json({ success: true, status: statusToSet });
    }

    // 3. Reset Single Device
    if (action === 'reset_device') {
      const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (userErr || !userData.user) throw new Error('Student not found.');

      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { ...userData.user.user_metadata, device_id: null },
      });

      if (updateErr) throw updateErr;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}