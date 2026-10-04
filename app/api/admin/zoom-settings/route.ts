import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET: Fetch current Zoom credentials
export async function GET() {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from('zoom_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      accountId: data?.account_id || '',
      clientId: data?.client_id || '',
      clientSecret: data?.client_secret || '',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Save credentials or Test Zoom Connection
export async function POST(req: Request) {
  try {
    const supabaseAdmin = getAdminClient();
    const body = await req.json();
    const { action, accountId, clientId, clientSecret } = body;

    // Action 1: Test Connection
    if (action === 'test_connection') {
      if (!accountId || !clientId || !clientSecret) {
        return NextResponse.json({ success: false, error: 'කරුණාකර සියලුම Credentials පුරවන්න.' }, { status: 400 });
      }

      const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId.trim()}`;
      const authHeader = Buffer.from(`${clientId.trim()}:${clientSecret.trim()}`).toString('base64');

      const testRes = await fetch(tokenUrl, {
        method: 'POST',
        headers: { Authorization: `Basic ${authHeader}` },
        cache: 'no-store',
      });

      if (!testRes.ok) {
        return NextResponse.json({ 
          success: false, 
          error: 'Zoom එකට සම්බන්ධ විය නොහැක! ඇතුළත් කළ Account ID, Client ID හෝ Client Secret එක වැරදියි.' 
        });
      }

      return NextResponse.json({ success: true, message: '✅ Zoom Account එක සාර්ථකව Connect විය!' });
    }

    // Action 2: Save Credentials
    if (action === 'save_credentials') {
      const { error } = await supabaseAdmin
        .from('zoom_settings')
        .upsert([
          {
            id: 1,
            account_id: accountId?.trim() || '',
            client_id: clientId?.trim() || '',
            client_secret: clientSecret?.trim() || '',
            updated_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Zoom Credentials සාර්ථකව සුරැකිණි!' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}