'use client';

import React, { useState } from 'react';
import { 
  Users, Video, DollarSign, Plus, ArrowLeft, CheckCircle2, 
  XCircle, ShieldAlert, FileText, Bell, RefreshCw, UserPlus, Download
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [adminTab, setAdminTab] = useState<'classes' | 'students' | 'slips' | 'marking' | 'notices'>('classes');

  // State Demos
  const [slips, setSlips] = useState([
    { id: 1, student: 'Kasun Bandara', email: 'kasun@gmail.com', amount: 'රු. 3,500', course: '2026 Chemistry Revision', date: 'Today 10:30 AM', status: 'Pending' },
    { id: 2, student: 'Sithmi Nimanthi', email: 'sithmi@gmail.com', amount: 'රු. 2,500', course: 'Organic Theory Book', date: 'Yesterday', status: 'Pending' }
  ]);

  const [students, setStudents] = useState([
    { id: 'ST-101', name: 'Nuwan Sameera', email: 'nuwan.student2026@gmail.com', phone: '0771234567', batch: '2026 A/L', active: true, device: 'MacBook Air - Chrome' },
    { id: 'ST-102', name: 'Chamodi Perera', email: 'chamodi@gmail.com', phone: '0719876543', batch: '2026 A/L', active: true, device: 'iPhone 15 - Safari' },
    { id: 'ST-103', name: 'Lahiru Madushan', email: 'lahiru@gmail.com', phone: '0754433221', batch: '2026 Revision', active: false, device: 'Blocked / Suspended' }
  ]);

  const [classes, setClasses] = useState([
    { id: 1, title: 'කාබනික රසායනය - විශේෂ ප්‍රශ්න පත්‍ර සාකච්ඡාව', date: '2026-08-25', time: '20:00', duration: '3h', batch: '2026 A/L' }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const handleApproveSlip = (id: number) => {
    setSlips(slips.map(s => s.id === id ? { ...s, status: 'Approved' } : s));
    alert('Bank Slip එක Approve විය! ශිෂ්‍යයාට Access ක්ෂණිකව Unlock විය.');
  };

  const toggleStudentStatus = (id: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate || !newTime) return;
    setClasses([...classes, {
      id: Date.now(),
      title: newTitle,
      date: newDate,
      time: newTime,
      duration: '2.5h',
      batch: '2026 A/L'
    }]);
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    alert('Zoom Live Class එක LMS එකට Schedule විය!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg text-white">Teacher Admin Portal</h1>
          <p className="text-xs text-slate-400">Class Scheduling, Student Security & Store Management</p>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button onClick={() => setAdminTab('classes')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${adminTab === 'classes' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
            Zoom Classes
          </button>
          <button onClick={() => setAdminTab('students')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${adminTab === 'students' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
            Students & Devices
          </button>
          <button onClick={() => setAdminTab('slips')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${adminTab === 'slips' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
            Bank Slips ({slips.filter(s => s.status === 'Pending').length})
          </button>
          <button onClick={() => setAdminTab('marking')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${adminTab === 'marking' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
            Assignments
          </button>
        </nav>

        <Link href="/" className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5"/> Portal
        </Link>
      </header>

      {/* Mobile Tabs */}
      <div className="flex md:hidden overflow-x-auto gap-2 p-4 bg-slate-900 border-b border-slate-800">
        <button onClick={() => setAdminTab('classes')} className={`px-3 py-1.5 rounded-lg text-xs ${adminTab === 'classes' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Classes</button>
        <button onClick={() => setAdminTab('students')} className={`px-3 py-1.5 rounded-lg text-xs ${adminTab === 'students' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Students</button>
        <button onClick={() => setAdminTab('slips')} className={`px-3 py-1.5 rounded-lg text-xs ${adminTab === 'slips' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Bank Slips</button>
        <button onClick={() => setAdminTab('marking')} className={`px-3 py-1.5 rounded-lg text-xs ${adminTab === 'marking' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Marking</button>
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400">ලියාපදිංචි සිසුන්</span>
            <p className="text-2xl font-extrabold text-white mt-1">248</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400">Pending Bank Slips</span>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{slips.filter(s => s.status === 'Pending').length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400">පැවැත්වූ Classes</span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">36</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400">මාසික ආදායම</span>
            <p className="text-2xl font-extrabold text-blue-400 mt-1">රු. 865,000</p>
          </div>
        </div>

        {/* TAB 1: ZOOM CLASSES */}
        {adminTab === 'classes' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-white">
                <Plus className="text-indigo-400 w-5 h-5" /> Zoom Class එකක් Schedule කිරීම
              </h2>
              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">මාතෘකාව</label>
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="උදා: Inorganic Flame Tests" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">දිනය</label>
                  <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">වේලාව</label>
                  <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold text-white rounded-xl transition text-sm cursor-pointer">
                  Schedule Zoom Class
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <h2 className="text-base font-bold mb-4 text-white">Schedule කර ඇති Classes</h2>
              <div className="space-y-3">
                {classes.map((cls) => (
                  <div key={cls.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white text-sm">{cls.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{cls.date} • {cls.time} ({cls.duration})</p>
                    </div>
                    <button onClick={() => alert("Zoom Host Meeting එක ආරම්භ වේ!")} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition">
                      Start Class (Host)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENTS MANAGEMENT & ACCESS CONTROL */}
        {adminTab === 'students' && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-white">ලියාපදිංචි ශිෂ්‍යයන් (No Public Registration)</h2>
                <p className="text-xs text-slate-400">ගුරුතුමා විසින් පමණක් Add කරන සහ Access පාලනය කරන සිසුන් ලැයිස්තුව.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => alert("Excel / CSV Bulk Upload Window එක විවෘත වේ!")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1">
                  <Download className="w-3.5 h-3.5"/> Bulk CSV Import
                </button>
                <button onClick={() => alert("ශිෂ්‍යයෙක් Register කිරීමේ Form එක විවෘත වේ!")} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-lg text-white flex items-center gap-1">
                  <UserPlus className="w-3.5 h-3.5"/> Add New Student
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Index / Name</th>
                    <th className="p-3">Email & Contact</th>
                    <th className="p-3">Logged Device (Anti-Share)</th>
                    <th className="p-3">Access Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-950/40">
                      <td className="p-3">
                        <p className="font-bold text-white">{st.name}</p>
                        <span className="text-[10px] text-slate-500">{st.id} • {st.batch}</span>
                      </td>
                      <td className="p-3">
                        <p>{st.email}</p>
                        <span className="text-[10px] text-slate-500">{st.phone}</span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-400">{st.device}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${st.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {st.active ? 'Active Access' : 'Blocked / Unpaid'}
                        </span>
                      </td>
                      <td className="p-3 flex items-center gap-2">
                        <button onClick={() => toggleStudentStatus(st.id)} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px]">
                          {st.active ? 'Block Access' : 'Activate'}
                        </button>
                        <button onClick={() => alert(`${st.name} ගේ Device Lock එක Reset විය!`)} title="Device Reset" className="p-1 hover:text-white text-slate-400">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BANK SLIP APPROVAL QUEUE */}
        {adminTab === 'slips' && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">බැංකු රිසිට්පත් තහවුරු කිරීම (Slip Approvals)</h2>
              <p className="text-xs text-slate-400">ළමයින් Upload කළ Slips පරීක්ෂා කර එක් Click එකකින් Access ලබාදෙන්න.</p>
            </div>

            <div className="space-y-3">
              {slips.map((slip) => (
                <div key={slip.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">{slip.student}</h3>
                      <span className="text-xs text-blue-400 font-bold">{slip.amount}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{slip.course} • {slip.email} • {slip.date}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => alert("Bank Slip Image එක Preview වේ!")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-300">
                      View Slip Image
                    </button>
                    {slip.status === 'Pending' ? (
                      <button onClick={() => handleApproveSlip(slip.id)} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve Access
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-bold px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        ✓ Approved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ASSIGNMENT MARKING & MODEL ANSWERS */}
        {adminTab === 'marking' && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">පැවරුම් ලකුණු ලබාදීම සහ Model Answers මුදාහැරීම</h2>
              <p className="text-xs text-slate-400">ශිෂ්‍යයන්ගේ උත්තර පත්‍ර පරීක්ෂා කර Marks & Feedback ලබාදෙන්න.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-white">Kasun Bandara - Organic Chemistry Tute 04</h3>
                <span className="text-xs text-amber-400">Submitted: Aug 24</span>
              </div>
              <div className="flex items-center gap-3">
                <input type="number" placeholder="Marks (100)" className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white" />
                <input type="text" placeholder="Teacher Feedback / අඩුපාඩු සටහන" className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white" />
                <button onClick={() => alert("ලකුණු සහ Model Answer එක ශිෂ්‍යයාට Release විය!")} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg">
                  Submit Mark
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}