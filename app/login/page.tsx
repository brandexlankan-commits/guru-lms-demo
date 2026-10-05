'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Device Fingerprint එකක් සාදාගැනීම හෝ localStorage වෙතින් ලබාගැනීම
  const getOrCreateDeviceId = () => {
    let devId = localStorage.getItem('guru_device_id');
    if (!devId) {
      const randomHex = Math.random().toString(36).substring(2, 9);
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const platform = isMobile ? 'Mobile' : 'Desktop';
      devId = `DEV_${platform}_${randomHex}_${Date.now().toString(36)}`;
      localStorage.setItem('guru_device_id', devId);
    }
    return devId;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const cleanUser = username.trim().toLowerCase();
      // Username එක හෝ Email එක format කරගැනීම
      const email = cleanUser.includes('@') ? cleanUser : `${cleanUser}@guru.lk`;

      // 1. Supabase Auth හරහා Login වීම
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: password.trim(),
      });

      if (authError) {
        throw new Error('Username එක හෝ Password එක වැරදියි. කරුණාකර නැවත උත්සාහ කරන්න.');
      }

      if (!authData.user) {
        throw new Error('Login අසාර්ථක විය.');
      }

      // 2. Single-Device Lock ආරක්ෂණ පරීක්ෂාව
      const currentDeviceId = getOrCreateDeviceId();

      const verifyRes = await fetch('/api/auth/verify-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authData.user.id,
          deviceId: currentDeviceId,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.allowed) {
        // වෙනත් උපාංගයකින් පැමිණි විට Session එක ඉවත් කර අවහිර කිරීම
        await supabase.auth.signOut();
        throw new Error(verifyData.error || 'මෙම ගිණුම වෙනත් උපාංගයකට ලොක් වී ඇත.');
      }

      // සාර්ථක නම් Student Dashboard වෙත යොමු කිරීම
      router.push('/student/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0c1322] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white border-2 border-purple-500/50 flex items-center justify-center shadow-xl shadow-purple-500/25 overflow-hidden">
            <img 
              src="/logo.png" 
              alt="Learn ICT with Mano" 
              className="w-full h-full object-contain scale-[2.4] transform" 
            />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Learn ICT with Mano</h1>
            <p className="text-xs text-slate-400 mt-0.5">ශිෂ්‍ය පිවිසුම (Student Portal Login)</p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="උදා: kasuntestperera894"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#131c31] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password (මුරපදය)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#131c31] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'පරීක්ෂා වෙමින් පවතී...' : 'පද්ධතියට ඇතුළු වන්න (Login)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center gap-2 text-[11px] text-purple-300">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Single-Device Lock ආරක්ෂණය මඟින් ඔබගේ ගිණුම සුරක්ෂිත කර ඇත.</span>
        </div>
      </div>
    </div>
  );
}