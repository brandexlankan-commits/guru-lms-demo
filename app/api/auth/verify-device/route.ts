import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: Request) {
  try {
    const { userId, deviceId } = await req.json();

    if (!userId || !deviceId) {
      return NextResponse.json({ allowed: false, error: 'User ID සහ Device ID අවශ්‍ය වේ.' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();
    const { data: { user }, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userErr || !user) {
      return NextResponse.json({ allowed: false, error: 'ශිෂ්‍ය ගිණුම හමු නොවීය.' }, { status: 404 });
    }

    const existingDeviceId = user.user_metadata?.device_id;

    // 1. තවම කිසිදු උපාංගයක් ලොක් වී නැතිනම් -> පළමුව Login වන මෙම උපාංගයට ලොක් කිරීම (Auto-Lock)
    if (!existingDeviceId) {
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...user.user_metadata,
          device_id: deviceId,
        },
      });

      if (updateErr) throw updateErr;

      return NextResponse.json({ allowed: true, lockedNow: true });
    }

    // 2. ලොක් වී ඇති උපාංගයම නම් -> Login වීමට ඉඩ දීම
    if (existingDeviceId === deviceId) {
      return NextResponse.json({ allowed: true });
    }

    // 3. වෙනත් උපාංගයක් නම් (Fraud Attempt) -> Login වීම සම්පූර්ණයෙන්ම අවහිර කිරීම
    return NextResponse.json({
      allowed: false,
      error: '⚠️ මෙම ගිණුම දැනටමත් වෙනත් උපාංගයකට සම්බන්ධ කර ඇත (Single-Device Lock). කරුණාකර ඔබ ලියාපදිංචි වූ මුල් උපාංගයෙන් Login වන්න හෝ ගුරුතුමා අමතන්න.',
    });
  } catch (err: any) {
    console.error('Verify device error:', err);
    return NextResponse.json({ allowed: false, error: err.message }, { status: 500 });
  }
}