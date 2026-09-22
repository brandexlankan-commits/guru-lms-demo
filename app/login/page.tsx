'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(''); // Username හෝ Email
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const cleanInput = identifier.trim();
      // Username එකක් ඇතුළත් කළහොත් (@ නැතිනම්) internal email එක background එකෙන් සාදයි
      const loginEmail = cleanInput.includes('@')
        ? cleanInput
        : `${cleanInput.toLowerCase()}@guru.internal`;

      // 1. Supabase Auth හරහා Login වීම
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (authError || !authData.user) {
        throw new Error('Login අසාර්ථක විය. Username හෝ Password නිවැරදි දැයි පරීක්ෂා කරන්න.');
      }

      const userId = authData.user.id;

      // 2. Profile එක සහ Role එක ලබාගැනීම
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        throw new Error('පරිශීලක පැතිකඩ (Profile) හමු නොවීය.');
      }

      // 3. Single-Device Protection Logic
      let localDeviceId = localStorage.getItem('guru_device_id');
      if (!localDeviceId) {
        localDeviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        localStorage.setItem('guru_device_id', localDeviceId);
      }

      // Database එකේ current_device_id එක මේ Device එකට Update කිරීම
      await supabase
        .from('profiles')
        .update({ current_device_id: localDeviceId })
        .eq('id', userId);

      // 4. Role එක අනුව Dashboard එකට යොමු කිරීම
      if (profile.role === 'teacher' || profile.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }

    } catch (err: any) {
      setErrorMsg(err.message || 'දෝෂයක් සිදුවිය. නැවත උත්සාහ කරන්න.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">LMS Login Portal</h1>
          <p className="text-xs text-slate-400">ඔබගේ ගිණුමට Login වන්න (Single-Device Protected)</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">
              Username හෝ Email ලිපිනය
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Username (උදා: s801)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">මුරපදය (Password)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ආරක්ෂිතව Login වන්න'}
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-500 leading-relaxed">
          ආරක්ෂක හේතූන් මත එක් ගිණුමකින් එකවර ක්‍රියාත්මක විය හැක්කේ එක් උපාංගයකින් (Device) පමණි.
        </p>
      </div>
    </div>
  );
}