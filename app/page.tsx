'use client';

import React from 'react';
import Link from 'next/link';
import { 
  GraduationCap, Video, FileText, Award, ShieldCheck, 
  CheckCircle2, MessageSquare, ArrowRight, Lock, 
  Sparkles, Laptop, BookOpen, Clock, Users, ChevronRight,
  Code2, Building2, Layers
} from 'lucide-react';

export default function Home() {
  // 📞 ගුරුතුමාගේ නිල WhatsApp අංකය (0754403630)
  const teacherPhone = "94754403630";
  const defaultWhatsAppMsg = encodeURIComponent("ආයුබෝවන් සර්, මම පන්ති පිළිබඳ විස්තර දැනගැනීමට සහ ලියාපදිංචි වීමට කැමතියි.");
  const teacherWhatsApp = `https://wa.me/${teacherPhone}?text=${defaultWhatsAppMsg}`;

  // එක් එක් පන්තිය සඳහා විශේෂිත WhatsApp පණිවිඩ
  const getCourseWhatsAppUrl = (courseName: string) => {
    const msg = encodeURIComponent(`ආයුබෝවන් සර්, මම "${courseName}" පන්තිය පිළිබඳ විස්තර දැනගැනීමට කැමතියි.`);
    return `https://wa.me/${teacherPhone}?text=${msg}`;
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white selection:bg-purple-500 selection:text-white font-sans flex flex-col justify-between">
      
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#070b14]/85 border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white border border-purple-500/40 flex items-center justify-center shadow-lg shadow-purple-500/20 overflow-hidden shrink-0">
              <img 
                src="/logo.png" 
                alt="Learn ICT with Mano Logo" 
                className="w-full h-full object-contain scale-[2.2] transform" 
              />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-white flex items-center gap-1.5">
                Learn ICT <span className="text-purple-400">with Mano</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Smart Educational LMS</p>
            </div>
          </div>

          {/* Right Action: Student Login Button */}
          <div className="flex items-center gap-3">
            <Link 
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer group"
            >
              <GraduationCap className="w-4 h-4 text-purple-200 group-hover:scale-110 transition" />
              <span>Student Login</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-200 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION */}
      <main className="flex-1">
        <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden text-center">
          
          {/* Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
          <div className="absolute top-1/3 left-1/3 w-[350px] h-[260px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#131c31] border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>පාසල්, බාහිර උපාධි සහ විශ්වවිද්‍යාල සිසුන් සඳහාම වෙන්වූ Smart LMS පද්ධතිය</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] text-white">
              විභාගය සහ උපාධිය ඉහළින්ම ජයගන්න, <br />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                තාක්ෂණයේ නිවැරදි මඟපෙන්වීම.
              </span>
            </h1>

            {/* Sub-description */}
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              O/L, A/L ICT විශය නිර්දේශයේ සිට බාහිර උපාධි (BIT, BCS) සහ විශ්වවිද්‍යාල පරිගණක විද්‍යා මොඩියුලයන් දක්වා සියල්ල ප්‍රායෝගිකව සහ සරලව හදාරන්න.
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2.5 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <GraduationCap className="w-5 h-5" />
                <span>ශිෂ්‍ය පිවිසුම (LMS Portal)</span>
              </Link>

              <a
                href={teacherWhatsApp}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#0c1322] hover:bg-[#131c31] text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp මඟින් විමසන්න (075 440 3630)</span>
              </a>
            </div>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 pt-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Live Zoom Classes</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Full HD Recordings</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> PDF Tutes & Papers</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Device Protected Security</span>
            </div>

          </div>
        </section>

        {/* 3. CLASS CATEGORIES (4 SPECIALIZED TIERS) */}
        <section className="px-6 py-16 bg-[#0c1322]/50 border-y border-slate-800/60">
          <div className="max-w-7xl mx-auto space-y-10">
            
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-purple-400 tracking-wider uppercase">Our Courses & Classes</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">පැවැත්වෙන ප්‍රධාන පන්ති පාඨමාලා</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">ඔබට අදාළ අධ්‍යයන අංශය තෝරා පන්තියට ලියාපදිංචි වන්න හෝ LMS එකට Login වන්න.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: G.C.E. A/L ICT */}
              <div className="bg-[#0c1322] border border-purple-500/40 rounded-3xl p-6 shadow-xl shadow-purple-500/5 space-y-4 flex flex-col justify-between relative group hover:border-purple-400 transition">
                <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider">
                  Advanced Level
                </span>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg">
                    A/L
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition">A/L ICT (උසස් පෙළ)</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      සම්පූර්ණ විශය නිර්දේශය, Python Programming, Database Systems (SQL), Networking සහ පසුගිය විභාග ප්‍රශ්න පත්‍ර සාකච්ඡාව.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <a 
                    href={getCourseWhatsAppUrl("A/L ICT Class")}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>විමසන්න (WhatsApp)</span>
                  </a>
                </div>
              </div>

              {/* Card 2: බාහිර උපාධි (External Degrees) */}
              <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between hover:border-emerald-500/40 transition group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">බාහිර උපාධි (BIT / BCS)</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      UCSC BIT, University of Moratuwa BIT, BCS (HEQ) සහ විවෘත විශ්වවිද්‍යාල (OUSL) බාහිර උපාධි හදාරන සිසුන් සඳහා විශේෂිත මඟපෙන්වීම.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <a 
                    href={getCourseWhatsAppUrl("බාහිර උපාධි (BIT/BCS)")}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>විමසන්න (WhatsApp)</span>
                  </a>
                </div>
              </div>

              {/* Card 3: විශ්වවිද්‍යාල සිසුන් (University Students) */}
              <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between hover:border-cyan-500/40 transition group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">විශ්වවිද්‍යාල සිසුන් (Campus)</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      රාජ්‍ය සහ පෞද්ගලික විශ්වවිද්‍යාල (State & Private Campus) සිසුන් සඳහා C/C++, Java, OOP, Data Structures සහ Web Development මොඩියුල පුහුණුව.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <a 
                    href={getCourseWhatsAppUrl("විශ්වවිද්‍යාල IT මොඩියුල")}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>විමසන්න (WhatsApp)</span>
                  </a>
                </div>
              </div>

              {/* Card 4: O/L & Junior ICT */}
              <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between hover:border-indigo-500/40 transition group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
                    O/L
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">Grade 10 & 11 (O/L ICT)</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      සාමාන්‍ය පෙළ A සාමාර්ථයක් ඉලක්ක කරගත් සිද්ධාන්ත, ක්‍රමලේඛන මූලධර්ම සහ පසුගිය විභාග ප්‍රශ්න පත්‍ර සාකච්ඡාව.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <a 
                    href={getCourseWhatsAppUrl("O/L ICT Class")}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>විමසන්න (WhatsApp)</span>
                  </a>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 4. SMART LMS PLATFORM FEATURES */}
        <section className="px-6 py-20">
          <div className="max-w-6xl mx-auto space-y-12">
            
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Platform Features</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">අපේ Smart LMS එකෙන් ඔබට ලැබෙන වාසි</h2>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">පන්තියේ සියලුම අධ්‍යයන කටයුතු එකම පද්ධතියකින් පහසුවෙන් සහ ආරක්ෂිතව.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-6 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white">Live Zoom Classes</h4>
                <p className="text-xs text-slate-400 leading-relaxed">පැටලිලි සහගත ලින්ක් නැත. LMS එකට Login වී එක ක්ලික් එකකින් පන්තියට එක්වන්න.</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Laptop className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white">Class Recordings</h4>
                <p className="text-xs text-slate-400 leading-relaxed">පන්තිය මඟහැරුණත් ගැටලුවක් නැත. Full HD Recordings ඕනෑම වේලාවක නැවත නරඹන්න.</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white">Tutes & Handouts</h4>
                <p className="text-xs text-slate-400 leading-relaxed">විෂය නිර්දේශයේ සියලුම නිබන්ධන සහ කෙටි සටහන් PDF ලෙස ක්ෂණිකව Download කරගන්න.</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white">Assignments & Tasks</h4>
                <p className="text-xs text-slate-400 leading-relaxed">පැවරුම් Online භාරදී, ගුරුතුමා ලබාදෙන ලකුණු සහ ප්‍රතිපෝෂණ (Feedback) සෘජුවම බලාගන්න.</p>
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* 5. FOOTER */}
      <footer className="bg-[#05080e] border-t border-slate-800/80 px-6 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Learn ICT with Mano</span>
            <span>•</span>
            <span>Hotline: <strong className="text-emerald-400 font-mono">075 440 3630</strong></span>
            <span>•</span>
            <span>All rights reserved © 2026</span>
          </div>

          <div className="flex items-center gap-6">
            <a 
              href={teacherWhatsApp} 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-emerald-400 transition flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp: 075 440 3630</span>
            </a>
            
            {/* Discreet Teacher/Admin Access link */}
            <Link href="/login" className="hover:text-purple-400 transition font-mono text-[11px]">
              Teacher Login →
            </Link>
          </div>

        </div>
      </footer>

    </div>
  );
}