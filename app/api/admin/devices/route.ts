import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET: Return all registered students and their device lock status
export async function GET() {
  try {
    const supabaseAdmin = getAdminClient();

    // Fetch all users directly from Supabase Auth
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    });

    if (error) throw error;

    // Filter students
    const students = (users || [])
      .filter((u: any) => u.user_metadata?.username && u.email !== 'admin@guru.lk')
      .map((u: any) => {
        const deviceId = u.user_metadata?.device_id || null;
        return {
          id: u.id,
          fullName: u.user_metadata?.full_name || 'ශිෂ්‍යයා',
          username: u.user_metadata?.username || u.email?.split('@')[0],
          phone: u.user_metadata?.phone || '',
          deviceId: deviceId,
          isLocked: !!deviceId,
        };
      });

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
  } catch (err: any) {
    console.error('Error fetching devices:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Reset Device for single user or bulk reset
export async function POST(req: Request) {
  try {
    const supabaseAdmin = getAdminClient();
    const body = await req.json();
    const { action, userId } = body;

    if (action === 'reset_device') {
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      }

      const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (userErr || !userData.user) throw new Error('ශිෂ්‍යයා හමු නොවීය.');

      const updatedMeta = { ...userData.user.user_metadata, device_id: null };

      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: updatedMeta,
      });

      if (updateErr) throw updateErr;

      return NextResponse.json({ success: true, message: 'උපාංගය සාර්ථකව Reset කරන ලදී!' });
    }

    if (action === 'reset_all') {
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      if (error) throw error;

      for (const u of users) {
        if (u.user_metadata?.device_id) {
          await supabaseAdmin.auth.admin.updateUserById(u.id, {
            user_metadata: { ...u.user_metadata, device_id: null },
          });
        }
      }

      return NextResponse.json({ success: true, message: 'සියලුම උපාංග සාර්ථකව Unlock කරන ලදී!' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Error updating devices:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}