'use client';

import React, { useState, useEffect } from 'react';
import { 
  Video, Calendar, Clock, PlayCircle, Shield, ArrowLeft, 
  BookOpen, ShoppingBag, Bell, UploadCloud, CheckCircle2, FileText, 
  CreditCard, Smartphone, Download, UserCheck
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<'classes' | 'assignments' | 'store' | 'notices'>('classes');
  const studentEmail = "nuwan.student2026@gmail.com";
  const [watermarkPos, setWatermarkPos] = useState({ top: '25%', left: '35%' });
  const [slipUploaded, setSlipUploaded] = useState(false);
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);

  // Floating Watermark Animation
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 65) + 15;
      const randomLeft = Math.floor(Math.random() * 55) + 10;
      setWatermarkPos({ top: `${randomTop}%`, left: `${randomLeft}%` });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            AL
          </div>
          <div>
            <h2 className="font-bold text-base leading-none">A/L Master LMS</h2>
            <span className="text-xs text-slate-400">2026 Chemistry Batch</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button 
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${activeTab === 'classes' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Video className="w-4 h-4"/> Live & Recordings
          </button>
          <button 
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${activeTab === 'assignments' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <FileText className="w-4 h-4"/> Assignments & Tutes
          </button>
          <button 
            onClick={() => setActiveTab('store')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${activeTab === 'store' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <ShoppingBag className="w-4 h-4"/> Course & Book Store
          </button>
          <button 
            onClick={() => setActiveTab('notices')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${activeTab === 'notices' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Bell className="w-4 h-4"/> Notices
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">Nuwan Sameera</p>
            <p className="text-xs text-emerald-400 font-mono">● Single-Device Active</p>
          </div>
          <Link href="/" className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5"/> Portal
          </Link>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden overflow-x-auto gap-2 p-4 bg-slate-900 border-b border-slate-800">
        <button onClick={() => setActiveTab('classes')} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${activeTab === 'classes' ? 'bg-blue-600' : 'bg-slate-800'}`}>Live & Videos</button>
        <button onClick={() => setActiveTab('assignments')} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${activeTab === 'assignments' ? 'bg-blue-600' : 'bg-slate-800'}`}>Assignments</button>
        <button onClick={() => setActiveTab('store')} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${activeTab === 'store' ? 'bg-blue-600' : 'bg-slate-800'}`}>Store</button>
        <button onClick={() => setActiveTab('notices')} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${activeTab === 'notices' ? 'bg-blue-600' : 'bg-slate-800'}`}>Notices</button>
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* TAB 1: LIVE CLASSES & WATERMARKED RECORDINGS */}
        {activeTab === 'classes' && (
          <div className="space-y-8">
            {/* Live Class Card */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border border-blue-500/40 p-6 sm:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold animate-pulse">
                    ● LIVE ZOOM CLASS READY
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    කාබනික රසායනය - විශේෂ ප්‍රශ්න පත්‍ර සාකච්ඡාව
                  </h1>
                  <p className="text-slate-300 text-sm flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-400"/> අද රාත්‍රී 8:00 - 11:00</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-400"/> අගෝස්තු 25, 2026</span>
                  </p>
                </div>

                <button 
                  onClick={() => alert("Zoom Live Class එකට LMS එක හරහා ආරක්ෂිතව Login විය! (Attendance Auto Record විය)")}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2 text-base cursor-pointer"
                >
                  <Video className="w-5 h-5" /> Join Live Zoom Class
                </button>
              </div>
            </div>

            {/* Video Player Preview with Floating Watermark */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                    <PlayCircle className="text-blue-400" /> ආරක්ෂිත Class Recordings (Dynamic Watermark Protection)
                  </h2>
                  <p className="text-xs text-slate-400">වීඩියෝව මත ශිෂ්‍යයාගේ Email එක Float වන අයුරු (Screen-record proof protection)</p>
                </div>
                <span className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> DRM Secured
                </span>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <PlayCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-bold text-white">පාඩම 01: Organic Reaction Mechanisms Full Breakdown</h3>
                    <p className="text-xs text-slate-500 mt-1">Duration: 2h 45m • 1080p Stream</p>
                  </div>

                  {/* FLOATING ANTI-LEAK WATERMARK */}
                  <div 
                    style={{ top: watermarkPos.top, left: watermarkPos.left }}
                    className="absolute pointer-events-none transition-all duration-1000 ease-in-out opacity-35 select-none text-white text-xs sm:text-sm font-mono bg-slate-900/90 px-3 py-1 rounded border border-white/20 shadow-lg"
                  >
                    {studentEmail} • IP: 112.134.195.42
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
                  <h3 className="font-semibold text-sm text-slate-300 pb-2 border-b border-slate-800">
                    පසුගිය Recordings ලැයිස්තුව
                  </h3>
                  {[
                    { title: 'Organic Reaction Mechanisms', date: 'Aug 18, 2026', time: '2h 30m', active: true },
                    { title: 'Inorganic Flame Tests Revision', date: 'Aug 11, 2026', time: '3h 10m', active: false },
                    { title: 'Amines Preparation Breakdown', date: 'Aug 04, 2026', time: '2h 45m', active: false },
                  ].map((rec, i) => (
                    <div key={i} className={`p-3 rounded-xl border transition flex items-center justify-between ${rec.active ? 'bg-blue-600/10 border-blue-500/40 text-white' : 'bg-slate-950/40 border-slate-800/80 text-slate-400'}`}>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-tight">{rec.title}</p>
                        <p className="text-xs text-slate-500">{rec.date} • {rec.time}</p>
                      </div>
                      <PlayCircle className={`w-5 h-5 ${rec.active ? 'text-blue-400' : 'text-slate-600'}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ASSIGNMENTS & HOMEWORK SUBMISSION */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">පැවරුම් සහ නිබන්ධන (Assignments & Tutes)</h2>
              <p className="text-xs text-slate-400">උත්තර පත්‍ර Upload කිරීම සහ ලකුණු බලාගැනීම.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Active Assignment Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      භාරදිය යුතු දිනය: Aug 28, 2026 (11:59 PM)
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">Organic Chemistry Tute 04 - Reaction Sheet</h3>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <FileText className="w-4 h-4 text-blue-400"/> Tute_04_Questions.pdf
                  </div>
                  <button onClick={() => alert("ප්‍රශ්න පත්‍රය Download වේ!")} className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                    <Download className="w-3.5 h-3.5"/> Download
                  </button>
                </div>

                {/* Upload Answer Box */}
                {!assignmentSubmitted ? (
                  <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center space-y-3 bg-slate-950/40">
                    <UploadCloud className="w-8 h-8 text-blue-400 mx-auto" />
                    <p className="text-xs text-slate-300">ලියූ උත්තර කොළවල Photos හෝ PDF එක මෙතනට Upload කරන්න</p>
                    <button 
                      onClick={() => setAssignmentSubmitted(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-lg transition"
                    >
                      Upload Answer Script (Demo Submit)
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> උත්තර පත්‍රය සාර්ථකව භාරදුනි! (Marking Pending)
                  </div>
                )}
              </div>

              {/* Past Graded Assignment Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Marked & Reviewed
                </span>
                <h3 className="text-lg font-bold text-white">Inorganic Flame Tests - Assignment 01</h3>
                
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">ලබාගත් ලකුණු</p>
                    <p className="text-2xl font-black text-emerald-400">88 / 100</p>
                  </div>
                  <button onClick={() => alert("Model Answer Sheet එක Download වේ!")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg border border-slate-700 flex items-center gap-1">
                    <Download className="w-3.5 h-3.5"/> Model Answers
                  </button>
                </div>
                <p className="text-xs text-slate-400 italic bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <span className="font-bold text-slate-300">ගුරුතුමාගේ සටහන:</span> "ප්‍රශ්න අංක 4 හි වර්ණ විපර්යාසය නැවත ලියා පුහුණු වන්න. අනෙක් සියල්ල ඉතා විශිෂ්ටයි!"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COURSE & BOOK STORE */}
        {activeTab === 'store' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">පාඨමාලා සහ නිබන්ධන පොත් (Store)</h2>
              <p className="text-xs text-slate-400">Online Payments හෝ Bank Slip Upload මඟින් මිලදී ගන්න.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Product 1 */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="aspect-[4/3] bg-slate-950 rounded-xl flex items-center justify-center text-slate-600 border border-slate-800 font-bold text-sm">
                  📚 Organic Chemistry Complete Guide
                </div>
                <h3 className="font-bold text-white text-base">කාබනික රසායනය විශේෂ සිද්ධාන්ත පොත</h3>
                <p className="text-xs text-slate-400">Physical Book with Home Delivery Islandwide</p>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-extrabold text-blue-400">රු. 2,500</span>
                  <button 
                    onClick={() => {
                      const method = confirm("Online Card Payment එකක් කරන්න OK ඔබන්න. \nBank Slip එකක් Upload කරන්න Cancel ඔබන්න.");
                      if (method) alert("PayHere Payment Gateway එකට සම්බන්ධ වේ!");
                      else setSlipUploaded(true);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-lg transition"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Product 2 */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="aspect-[4/3] bg-slate-950 rounded-xl flex items-center justify-center text-slate-600 border border-slate-800 font-bold text-sm">
                  ⚡ 2026 Paper Class Full Pack
                </div>
                <h3 className="font-bold text-white text-base">2026 Revision Paper Pack (Aug Month)</h3>
                <p className="text-xs text-slate-400">Full Month Recordings + 4 Model Papers</p>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-extrabold text-blue-400">රු. 3,500</span>
                  <button 
                    onClick={() => alert("PayHere Payment Gateway එකට සම්බන්ධ වේ!")}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-lg transition"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>

            {slipUploaded && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                <span>📄 ඔබගේ බැංකු රිසිට්පත (Bank Slip) පද්ධතියට ලැබුණි. ගුරුතුමා Approve කළ පසු Access unlock වේ!</span>
                <span className="font-mono bg-amber-500/20 px-2 py-0.5 rounded">Status: Pending Verification</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: NOTICES & ANNOUNCEMENTS */}
        {activeTab === 'notices' && (
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-xl font-bold text-white">පන්ති නිවේදන පුවරුව (Notice Board)</h2>
            
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">New Update</span>
                <span className="text-xs text-slate-500">අගෝස්තු 24, 2026</span>
              </div>
              <h3 className="text-base font-bold text-white">අගෝස්තු 28 විශේෂ ප්‍රශ්න පත්‍ර සාකච්ඡාව පිළිබඳව</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                ලබන සිකුරාදා පැවැත්වෙන විශේෂ Revision පන්තියට පෙර සියලුම සිසුන් Tute 04 නිබන්ධනය සම්පූර්ණ කර Assignment tab එක හරහා Upload කිරීමට කටයුතු කරන්න.
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}