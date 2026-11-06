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
    const { fullName, username, phone, password, courseIds, existingUserId } = await req.json();

    if (!courseIds || courseIds.length === 0) {
      return NextResponse.json({ error: 'කරුණාකර පන්තියක් (Course) තෝරන්න.' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();
    let userId = existingUserId;
    let finalUsername = username;

    // 1. දැනටමත් ඉන්න ළමයෙක් නෙමෙයි නම් (අලුත් ලියාපදිංචියක් නම්), අලුතින් Auth User කෙනෙක් හදනවා
    if (!existingUserId) {
      if (!username || !password) {
        return NextResponse.json({ error: 'අවශ්‍ය සියලු තොරතුරු ඇතුළත් කරන්න.' }, { status: 400 });
      }

      const cleanUser = username.trim().toLowerCase();
      finalUsername = cleanUser;
      const email = `${cleanUser}@guru.lk`;

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: password.trim(),
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          username: cleanUser,
          phone: phone || '',
          initial_password: password.trim(),
          device_id: null,
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('මෙම Username එක දැනටමත් භාවිතයේ පවතී. කරුණාකර වෙනත් Username එකක් ලබාදෙන්න.');
        }
        throw authError;
      }
      userId = authData.user.id;
    }

    // 2. දැනටමත් Student Enroll වෙලා ඉන්න Courses ටික අරන්, duplicate වෙන ඒවා අයින් කරනවා
    const { data: existingEnrolls } = await supabaseAdmin
      .from('course_enrollments')
      .select('course_id')
      .eq('user_id', userId);
    
    const existingCourseIds = existingEnrolls?.map(e => e.course_id.toString()) || [];
    const newCourseIds = courseIds.filter((cid: string) => !existingCourseIds.includes(cid.toString()));

    // 3. අලුත් Courses ටිකට විතරක් Enroll කරනවා (දින 30ක access එකක් එක්ක)
    if (newCourseIds.length > 0) {
      const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const enrollments = newCourseIds.map((cid: string) => ({
        user_id: userId,
        course_id: cid,
        status: 'active',
        valid_until: validUntil,
      }));

      const { error: enrollErr } = await supabaseAdmin.from('course_enrollments').insert(enrollments);
      if (enrollErr) throw enrollErr;
    }

    return NextResponse.json({
      success: true,
      userId,
      username: finalUsername,
      message: existingUserId ? 'අලුත් පන්ති සාර්ථකව එකතු කරන ලදී.' : 'ශිෂ්‍යයා සාර්ථකව ලියාපදිංචි කෙරිණි.'
    });
  } catch (err: any) {
    console.error('Create student error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}