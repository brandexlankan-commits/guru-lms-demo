'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck, KeyRound, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(''); // Email or Username
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Form Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const cleanInput = identifier.trim().toLowerCase();
      let loginEmail = cleanInput;

      // Detect if user is attempting teacher/admin login
      const isTeacherIdentifier = 
        loginRole === 'teacher' || 
        cleanInput === 'admin' || 
        cleanInput === 'teacher' || 
        cleanInput.includes('admin') || 
        cleanInput.includes('teacher');

      if (!cleanInput.includes('@')) {
        if (isTeacherIdentifier) {
          // If teacher username typed without @
          loginEmail = cleanInput === 'admin' ? 'admin@learnict.lk' : `${cleanInput}@learnict.lk`;
        } else {
          loginEmail = `${cleanInput}@student.learnict.lk`;
        }
      }

      // 1. Authenticate with Supabase Auth
      let authResult = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      });

      // Fallback: If custom email domain failed for teacher, try raw email if input had @
      if (authResult.error && isTeacherIdentifier && !cleanInput.includes('@')) {
        authResult = await supabase.auth.signInWithPassword({
          email: `${cleanInput}@gmail.com`,
          password: password,
        });
      }

      if (authResult.error) {
        throw new Error('Invalid username or password. Please verify your credentials.');
      }

      const user = authResult.data.user;
      if (!user) {
        throw new Error('User authentication failed.');
      }

      const userEmail = (user.email || '').toLowerCase();
      const userMetaRole = (user.user_metadata?.role || '').toLowerCase();
      const userMetaUsername = (user.user_metadata?.username || '').toLowerCase();

      // 2. Strict Check for Admin / Teacher
      const isActuallyAdmin = 
        loginRole === 'teacher' ||
        isTeacherIdentifier ||
        userMetaRole === 'admin' || 
        userMetaRole === 'teacher' || 
        userMetaUsername === 'admin' ||
        userMetaUsername === 'teacher' ||
        userEmail.includes('admin') || 
        userEmail.includes('teacher') ||
        userEmail === 'mano.ict@gmail.com' ||
        (userEmail.endsWith('@learnict.lk') && !userEmail.includes('@student.'));

      if (isActuallyAdmin) {
        // Force redirect to Admin Dashboard
        window.location.href = '/admin/dashboard';
        return;
      }

      // 3. Device Locking Check for Students ONLY
      const currentDeviceId = localStorage.getItem('guru_device_token') || crypto.randomUUID();
      localStorage.setItem('guru_device_token', currentDeviceId);

      const registeredDeviceId = user.user_metadata?.device_id;

      if (!registeredDeviceId) {
        await fetch('/api/verify-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, deviceId: currentDeviceId }),
        });
      } else if (registeredDeviceId !== currentDeviceId) {
        await supabase.auth.signOut();
        throw new Error('Your account is registered to another device. Please contact teacher to unlock.');
      }

      // Redirect Student
      window.location.href = '/student/dashboard';

    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center p-4 sm:p-6 font-sans select-none">
      <div className="w-full max-w-md space-y-6">
        
        {/* Top Logo and Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-white border-2 border-purple-500/50 flex items-center justify-center shadow-2xl shadow-purple-500/30 overflow-hidden">
            <img 
              src="/logo.png" 
              alt="Learn ICT with Mano" 
              className="w-full h-full object-contain scale-[2.4] transform" 
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Learn ICT with Mano
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Learning Management System Portal
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-[#0c1322] border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative overflow-hidden">
          
          {/* Role Selector Tabs (Student vs Teacher) */}
          <div className="flex rounded-xl bg-[#131c31] p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => { setLoginRole('student'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                loginRole === 'student' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              👨‍🎓 Student Portal
            </button>
            <button
              type="button"
              onClick={() => { setLoginRole('teacher'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                loginRole === 'teacher' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              👨‍🏫 Teacher / Admin
            </button>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-xs font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-400" />
              <span>{loginRole === 'teacher' ? 'Admin Portal Sign In' : 'Student Sign In'}</span>
            </h2>
            <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
              {loginRole === 'teacher' ? 'Admin Gateway' : 'Single-Device Locked'}
            </span>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {loginRole === 'teacher' ? 'Teacher Email or Username *' : 'Student Username *'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder={loginRole === 'teacher' ? 'e.g. teacher or teacher@gmail.com' : 'e.g. kasun482'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#131c31] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#131c31] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 transition font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{loading ? 'Authenticating...' : loginRole === 'teacher' ? 'Sign In to Admin Hub' : 'Sign In to Student Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Anti-piracy protected & encrypted session</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}