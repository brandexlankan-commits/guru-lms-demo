import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { fullName, username, phone, password, courseIds } = await req.json();

    if (!fullName || !username || !password || !courseIds || courseIds.length === 0) {
      return NextResponse.json(
        { error: 'කරුණාකර සියලු අත්‍යවශ්‍ය තොරතුරු ඇතුළත් කරන්න.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.toLowerCase().trim();
    const dummyEmail = `${cleanUsername}@guru.internal`;

    // Supabase Admin Client එක (Service Role Key සහිතව)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 1. Supabase Auth හරහා නව User සාදයි
    const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: dummyEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        username: cleanUsername,
        phone: phone || '',
        role: 'student',
      },
    });

    if (authError) {
      if (authError.message.includes('already exists') || authError.message.includes('unique')) {
        return NextResponse.json(
          { error: 'මෙම Username එක දැනටමත් භාවිතයේ ඇත. වෙනත් Username එකක් තෝරන්න.' },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const studentId = userData.user.id;

    // 2. profiles table එකේ record එක සකස් කිරීම
    await supabaseAdmin.from('profiles').upsert({
      id: studentId,
      full_name: fullName,
      username: cleanUsername,
      phone: phone || '',
      role: 'student',
    });

    // 3. තෝරාගත් සියලුම පන්ති වලට දින 30ක කාලයක් සහිතව Enroll කිරීම
    const enrollments = courseIds.map((courseId: string) => ({
      user_id: studentId,
      course_id: courseId,
      status: 'active',
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    const { error: enrollError } = await supabaseAdmin
      .from('course_enrollments')
      .upsert(enrollments);

    if (enrollError) {
      return NextResponse.json({ error: enrollError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      student: {
        id: studentId,
        fullName,
        username: cleanUsername,
        password,
        phone,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}