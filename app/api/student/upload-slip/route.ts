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
    const { studentId, courseId, amount, slipUrl } = await req.json();

    if (!studentId || !courseId || !slipUrl) {
      return NextResponse.json({ error: 'අවශ්‍ය සියලු තොරතුරු ඇතුළත් කරන්න.' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    const { data, error } = await supabaseAdmin
      .from('slips')
      .insert([
        {
          student_id: studentId,
          course_id: courseId,
          amount: amount || 0,
          slip_url: slipUrl,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, slip: data });
  } catch (err: any) {
    console.error('Upload slip error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}