import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET: Resolve exact email by username or email identifier
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get('identifier')?.trim().toLowerCase();

    if (!identifier) {
      return NextResponse.json({ error: 'Identifier is required' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // 1. If it's already an email, return directly
    if (identifier.includes('@')) {
      return NextResponse.json({ email: identifier });
    }

    // 2. Search users in Supabase Auth by username metadata
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (error) throw error;

    const matchedUser = (users || []).find((u: any) => {
      const uName = (u.user_metadata?.username || '').toLowerCase();
      const emailPrefix = (u.email?.split('@')[0] || '').toLowerCase();
      return uName === identifier || emailPrefix === identifier;
    });

    if (matchedUser && matchedUser.email) {
      return NextResponse.json({ email: matchedUser.email });
    }

    // 3. Fallback to default pattern if not matched
    return NextResponse.json({ email: `${identifier}@gmail.com` });
  } catch (err: any) {
    console.error('Error resolving email:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}