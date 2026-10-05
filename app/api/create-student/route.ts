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
    const { fullName, username, phone, password, courseIds } = await req.json();

    if (!username || !password || !courseIds || courseIds.length === 0) {
      return NextResponse.json({ error: 'අවශ්‍ය සියලු තොරතුරු ඇතුළත් කරන්න.' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();
    const cleanUser = username.trim().toLowerCase();
    const email = `${cleanUser}@guru.lk`;

    // 1. Create User in Supabase Auth with initial_password in user_metadata
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password.trim(),
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        username: cleanUser,
        phone: phone || '',
        initial_password: password.trim(), // ගුරුතුමාට Dashboard එකේ පෙන්වීම සඳහා
        device_id: null,
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw new Error('මෙම Username එක දැනටමත් භාවිතයේ පවතී. කරුණාකර වෙනත් Username එකක් ලබාදෙන්න.');
      }
      throw authError;
    }

    const userId = authData.user.id;

    // 2. Enroll student into selected courses (Default 30 days active access)
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const enrollments = courseIds.map((cid: string) => ({
      user_id: userId,
      course_id: cid,
      status: 'active',
      valid_until: validUntil,
    }));

    const { error: enrollErr } = await supabaseAdmin.from('course_enrollments').insert(enrollments);
    if (enrollErr) throw enrollErr;

    return NextResponse.json({
      success: true,
      userId,
      username: cleanUser,
      password: password.trim(),
    });
  } catch (err: any) {
    console.error('Create student error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}