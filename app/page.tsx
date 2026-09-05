import Link from 'next/link';
import { GraduationCap, ShieldCheck, UserCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm font-medium">
          <ShieldCheck className="w-4 h-4" /> Next-Gen Secure LMS Platform
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          උසස් පෙළ පන්ති සඳහා <br/>
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-teal-300 bg-clip-text text-transparent">
            Smart LMS Demo Portal
          </span>
        </h1>
        
        <p className="text-slate-400 text-base max-w-xl mx-auto">
          Zoom Live Classes, Dynamic Watermarked Recordings සහ Teacher Admin කළමනාකරණ පද්ධතිය.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 pt-6 text-left">
          {/* Student Dashboard Card */}
          <Link 
            href="/student/dashboard" 
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 transition group block"
          >
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl w-fit mb-4 group-hover:scale-110 transition">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-1">Student Dashboard (ළමයාගේ පැත්ත)</h3>
            <p className="text-xs text-slate-400 mb-4">Live Zoom Join වීම, Protected Recordings නැරඹීම, සහ Profile එක.</p>
            <span className="text-blue-400 font-semibold text-sm inline-flex items-center gap-1">
              ශිෂ්‍ය Dashboard එක බලන්න →
            </span>
          </Link>

          {/* Teacher Admin Card */}
          <Link 
            href="/admin/dashboard" 
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition group block"
          >
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl w-fit mb-4 group-hover:scale-110 transition">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-1">Teacher Admin Panel (ගුරුතුමාගේ පැත්ත)</h3>
            <p className="text-xs text-slate-400 mb-4">Zoom Class Schedule කිරීම, ළමයින්ගේ Access පාලනය, සහ Slips Approval.</p>
            <span className="text-indigo-400 font-semibold text-sm inline-flex items-center gap-1">
              Admin Portal එක බලන්න →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}