import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET() {
  try {
    const supabaseAdmin = getAdminClient();

    // 1. Get all student profiles
    const { data: profiles, error: profError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, username, phone, current_device_id, role, updated_at')
      .neq('role', 'teacher')
      .order('updated_at', { ascending: false });

    if (profError) throw profError;

    // 2. Fetch auth metadata for safety (names / usernames)
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    const authMap = new Map();
    authData?.users?.forEach((u) => {
      authMap.set(u.id, u);
    });

    const students = (profiles || []).map((p: any) => {
      const authUser = authMap.get(p.id);
      return {
        id: p.id,
        fullName: p.full_name || authUser?.user_metadata?.full_name || 'ශිෂ්‍යයා',
        username: p.username || authUser?.user_metadata?.username || authUser?.email?.split('@')[0] || 'user',
        phone: p.phone || authUser?.user_metadata?.phone || '',
        deviceId: p.current_device_id || null,
        isLocked: !!p.current_device_id,
        updatedAt: p.updated_at,
      };
    });

    // 3. Stats Calculation
    const totalStudents = students.length;
    const lockedCount = students.filter((s: any) => s.isLocked).length;
    const unlockedCount = totalStudents - lockedCount;

    return NextResponse.json({
      stats: {
        totalStudents,
        lockedCount,
        unlockedCount,
      },
      students,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getAdminClient();
    const { action, userId } = await req.json();

    // ACTION 1: RESET SINGLE STUDENT DEVICE
    if (action === 'reset_device') {
      if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ current_device_id: null })
        .eq('id', userId);

      if (error) throw error;
      return NextResponse.json({ success: true, message: 'උපාංගය සාර්ථකව Reset කරන ලදී!' });
    }

    // ACTION 2: RESET ALL DEVICES (BULK RESET)
    if (action === 'reset_all') {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ current_device_id: null })
        .neq('role', 'teacher');

      if (error) throw error;
      return NextResponse.json({ success: true, message: 'සියලුම සිසුන්ගේ උපාංග සාර්ථකව Unlock කරන ලදී!' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}