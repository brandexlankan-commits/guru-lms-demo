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

    // 1. Fetch all slips
    const { data: slips, error: slipErr } = await supabaseAdmin
      .from('bank_slips')
      .select('*')
      .order('created_at', { ascending: false });

    if (slipErr) throw slipErr;

    if (!slips || slips.length === 0) {
      return NextResponse.json({
        stats: { total: 0, pending: 0, approved: 0, rejected: 0 },
        slips: [],
      });
    }

    // 2. Fetch student profiles / auth details
    const studentIds = Array.from(new Set(slips.map((s: any) => s.student_id).filter(Boolean)));

    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, username, phone')
      .in('id', studentIds);

    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    const authMap = new Map();
    authData?.users?.forEach((u) => {
      authMap.set(u.id, u);
    });

    // prof: any යෙදීමෙන් TypeScript error එක විසඳා ඇත
    const enrichedSlips = slips.map((slip: any) => {
      const prof: any = profiles?.find((p: any) => p.id === slip.student_id) || {};
      const authUser = authMap.get(slip.student_id);

      const fullName =
        prof.full_name ||
        authUser?.user_metadata?.full_name ||
        authUser?.user_metadata?.name ||
        'ශිෂ්‍යයා';

      const username =
        prof.username ||
        authUser?.user_metadata?.username ||
        authUser?.email?.split('@')[0] ||
        'user';

      const phone =
        prof.phone ||
        authUser?.user_metadata?.phone ||
        '';

      return {
        ...slip,
        studentName: fullName,
        studentUsername: username,
        studentPhone: phone,
      };
    });

    const pending = enrichedSlips.filter((s: any) => s.status === 'pending').length;
    const approved = enrichedSlips.filter((s: any) => s.status === 'approved').length;
    const rejected = enrichedSlips.filter((s: any) => s.status === 'rejected').length;

    return NextResponse.json({
      stats: {
        total: enrichedSlips.length,
        pending,
        approved,
        rejected,
      },
      slips: enrichedSlips,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getAdminClient();
    const { action, slipId, studentId, courseId } = await req.json();

    if (!slipId) {
      return NextResponse.json({ error: 'Slip ID is required' }, { status: 400 });
    }

    // ACTION 1: APPROVE SLIP
    if (action === 'approve') {
      const { error: slipUpdateErr } = await supabaseAdmin
        .from('bank_slips')
        .update({ status: 'approved' })
        .eq('id', slipId);

      if (slipUpdateErr) throw slipUpdateErr;

      if (studentId && courseId) {
        const now = new Date();
        const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const { error: userErr } = await supabaseAdmin
          .from('course_enrollments')
          .update({ status: 'active', valid_until: validUntil })
          .match({ user_id: studentId, course_id: courseId });

        if (userErr) {
          await supabaseAdmin
            .from('course_enrollments')
            .update({ status: 'active', valid_until: validUntil })
            .match({ student_id: studentId, course_id: courseId });
        }
      }

      return NextResponse.json({
        success: true,
        message: 'රිසිට්පත අනුමත කරන ලදී! පන්ති ප්‍රවේශය සක්‍රිය විය.',
      });
    }

    // ACTION 2: REJECT SLIP
    if (action === 'reject') {
      const { error: rejectErr } = await supabaseAdmin
        .from('bank_slips')
        .update({ status: 'rejected' })
        .eq('id', slipId);

      if (rejectErr) throw rejectErr;

      return NextResponse.json({
        success: true,
        message: 'රිසිට්පත ප්‍රතික්ෂේප කරන ලදී.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}