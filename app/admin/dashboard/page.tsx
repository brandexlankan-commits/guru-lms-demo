'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'classes' | 'courses' | 'slips' | 'devices' | 'students'>('students');

  // Sub-tabs inside Students Tab
  const [studentSubTab, setStudentSubTab] = useState<'register' | 'list'>('register');

  // Courses state
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedFilterCourse, setSelectedFilterCourse] = useState<string>('');

  // Add Student Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [createdStudentData, setCreatedStudentData] = useState<any>(null);

  // Enrolled Students List State
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Initial Load
  useEffect(() => {
    fetchCourses();
    generateRandomPassword();
  }, []);

  // When class filter changes, fetch students
  useEffect(() => {
    if (activeTab === 'students' && studentSubTab === 'list' && selectedFilterCourse) {
      fetchStudentsForCourse(selectedFilterCourse);
    }
  }, [activeTab, studentSubTab, selectedFilterCourse]);

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setCourses(data);
      setSelectedFilterCourse(data[0].id.toString());
    } else {
      const fallback = [
        { id: 'c1', title: 'Grade 7 Science - Theory Masterclass' },
        { id: 'c2', title: 'Grade 7 Science - Paper Class' },
        { id: 'c3', title: 'Grade 8 Science - Full Syllabus' }
      ];
      setCourses(fallback);
      setSelectedFilterCourse('c1');
    }
  };

  const fetchStudentsForCourse = async (courseId: string) => {
    setLoadingStudents(true);
    try {
      const res = await fetch(`/api/manage-student?courseId=${courseId}`);
      const data = await res.json();
      if (res.ok) {
        setStudentsList(data.students || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStudents(false);
    }
  };

  const generateRandomPassword = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setPassword(`Guru#${randomDigits}`);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFullName(val);
    if (!username || username === '') {
      const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '');
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      setUsername(clean ? `${clean}${randomSuffix}` : '');
    }
  };

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (selectedCourses.length === 0) {
      setFormError('කරුණාකර ශිෂ්‍යයා සඳහා අවම වශයෙන් එක් පන්තියක්වත් තෝරන්න.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          username,
          phone,
          password,
          courseIds: selectedCourses,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to create student');

      setCreatedStudentData({
        fullName,
        username,
        phone,
        password,
        selectedCoursesNames: courses
          .filter(c => selectedCourses.includes(c.id))
          .map(c => c.title)
          .join(', '),
      });

      setFullName('');
      setUsername('');
      setPhone('');
      setSelectedCourses([]);
      generateRandomPassword();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extend 30 days access
  const handleExtendAccess = async (student: any) => {
    setActionLoadingId(`extend_${student.userId}`);
    try {
      const res = await fetch('/api/manage-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'extend_access',
          userId: student.userId,
          courseId: selectedFilterCourse,
          enrollmentId: student.enrollmentId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Instant state update
      setStudentsList(prev =>
        prev.map(s => (s.userId === student.userId ? { ...s, validUntil: data.validUntil, status: 'active' } : s))
      );
      alert(`${student.fullName} ගේ පන්ති කාලය තවත් දින 30 කට දීර්ඝ කරන ලදී!`);
    } catch (err: any) {
      alert('දෝෂයකි: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reset student device lock
  const handleResetDevice = async (student: any) => {
    if (!confirm(`${student.fullName} ගේ උපාංගය Reset කිරීමට අවශ්‍යද? එමඟින් ඔහුට නව Phone හෝ Laptop එකකින් Login විය හැක.`)) {
      return;
    }
    setActionLoadingId(`reset_${student.userId}`);
    try {
      const res = await fetch('/api/manage-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_device',
          userId: student.userId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStudentsList(prev =>
        prev.map(s => (s.userId === student.userId ? { ...s, deviceId: null } : s))
      );
      alert('උපාංගය සාර්ථකව Reset කරන ලදී!');
    } catch (err: any) {
      alert('දෝෂයකි: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const generateWhatsAppMessage = () => {
    if (!createdStudentData) return '';
    return `ආයුබෝවන් ${createdStudentData.fullName},
ඔබව සාර්ථකව පන්ති පද්ධතියට (LMS) ලියාපදිංචි කරන ලදී.

📚 පන්ති: ${createdStudentData.selectedCoursesNames}
🌐 Login Link: https://guru-lms-demo.vercel.app/login
👤 Username: ${createdStudentData.username}
🔑 Password: ${createdStudentData.password}

⚠️ ආරක්ෂක උපදෙස්: 
ඔබ පළමුව Login වන උපාංගයට (Phone හෝ Laptop) ඔබගේ ගිණුම ස්වයංක්‍රීයව ලොක් වේ. එබැවින් ඔබේ පෞද්ගලික උපාංගයෙන් පමණක් Login වන්න.`;
  };

  // Filter students based on search query
  const filteredStudents = studentsList.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#070b14] text-white p-6 md:p-10 font-sans">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xl shadow-lg shadow-purple-500/10">
            🛡️
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Teacher Admin Portal</h1>
            <p className="text-xs text-slate-400">A/L Guru (Teacher Control Center)</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex flex-wrap items-center gap-2 bg-[#0d1424] p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'classes' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Classes & Videos
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'students' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            👨‍🎓 Students / සිසුන්
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'courses' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Courses / පන්ති
          </button>
          <button
            onClick={() => setActiveTab('slips')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'slips' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Slip Approvals
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'devices' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Devices
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="mt-8 max-w-7xl mx-auto">
        {/* TAB 1: STUDENTS MANAGEMENT */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* SUB-TABS: REGISTER vs CLASS-WISE STUDENTS */}
            <div className="flex border-b border-slate-800 gap-4">
              <button
                onClick={() => setStudentSubTab('register')}
                className={`pb-3 text-sm font-semibold transition border-b-2 ${
                  studentSubTab === 'register'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                ➕ නව ශිෂ්‍ය ලියාපදිංචිය (Registration)
              </button>
              <button
                onClick={() => setStudentSubTab('list')}
                className={`pb-3 text-sm font-semibold transition border-b-2 ${
                  studentSubTab === 'list'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                📋 පන්ති අනුව සිසුන් ලැයිස්තුව (Class-wise Students)
              </button>
            </div>

            {/* 1.1 REGISTER SUB-TAB */}
            {studentSubTab === 'register' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-7 bg-[#0c1322] border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">👤</span>
                    <div>
                      <h2 className="text-lg font-bold">නව ශිෂ්‍යයෙකු ලියාපදිංචි කිරීම (Add Student)</h2>
                      <p className="text-xs text-slate-400">ගාස්තු ගෙවූ සිසුන්ට Username සහ Password සකස් කර පන්ති වලට ඇතුළත් කරන්න.</p>
                    </div>
                  </div>

                  {formError && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      ⚠️ {formError}
                    </div>
                  )}

                  <form onSubmit={handleCreateStudent} className="space-y-5">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">ශිෂ්‍යයාගේ සම්පූර්ණ නම (Full Name) *</label>
                      <input
                        type="text"
                        required
                        placeholder="උදා: Kasun Perera"
                        value={fullName}
                        onChange={handleNameChange}
                        className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Username (Login සඳහා) *</label>
                        <input
                          type="text"
                          required
                          placeholder="kasun482"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                          className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-3 text-sm text-purple-300 font-mono focus:outline-none focus:border-purple-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">WhatsApp දුරකථන අංකය</label>
                        <input
                          type="tel"
                          placeholder="0771234567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-medium text-slate-300">තාවකාලික මුරපදය (Password) *</label>
                        <button type="button" onClick={generateRandomPassword} className="text-xs text-purple-400 hover:underline">
                          🔄 අලුත් Password එකක් සාදන්න
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">සම්බන්ධ වන පන්ති තෝරන්න (Select Courses) *</label>
                      <div className="space-y-2.5 bg-[#131c31] p-4 rounded-xl border border-slate-800">
                        {courses.map((course) => (
                          <label key={course.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-800/50 transition">
                            <input
                              type="checkbox"
                              checked={selectedCourses.includes(course.id)}
                              onChange={() => handleCourseToggle(course.id)}
                              className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                            />
                            <span className="text-sm text-slate-200">{course.title}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-purple-600/20 disabled:opacity-50"
                    >
                      {isSubmitting ? 'ශිෂ්‍යයා ලියාපදිංචි වෙමින් පවතී...' : '+ ශිෂ්‍යයා ලියාපදිංචි කර ඇතුළත් කරන්න'}
                    </button>
                  </form>
                </div>

                {/* WhatsApp Output Preview */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  {createdStudentData ? (
                    <div className="bg-[#0c1322] border border-emerald-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                      <div className="flex items-center gap-3 text-emerald-400 mb-4">
                        <span className="text-xl">✅</span>
                        <h3 className="font-bold text-base">ශිෂ්‍යයා සාර්ථකව එක් කරන ලදී!</h3>
                      </div>
                      <p className="text-xs text-slate-300 mb-3">පහත පණිවිඩය Copy කර හෝ කෙලින්ම WhatsApp හරහා ශිෂ්‍යයාට යවන්න:</p>
                      <div className="bg-[#131c31] p-4 rounded-xl border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-line leading-relaxed mb-4">
                        {generateWhatsAppMessage()}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generateWhatsAppMessage());
                            alert('WhatsApp Message එක Copy කරගන්නා ලදී!');
                          }}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition text-center"
                        >
                          📋 Copy Details
                        </button>
                        {createdStudentData.phone && (
                          <a
                            href={`https://wa.me/94${createdStudentData.phone.replace(/^0/, '')}?text=${encodeURIComponent(
                              generateWhatsAppMessage()
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition text-center"
                          >
                            💬 Open WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#0c1322] border border-slate-800/80 rounded-2xl p-6 text-center text-slate-500 flex flex-col items-center justify-center min-h-[300px]">
                      <span className="text-4xl mb-3">💬</span>
                      <h4 className="text-slate-300 font-medium text-sm">WhatsApp Credentials Generator</h4>
                      <p className="text-xs max-w-xs mt-1">ශිෂ්‍යයෙකු ලියාපදිංචි කළ වහාම ඔහුට යැවිය යුතු WhatsApp Login පණිවිඩය මෙතනින් සූදානම් වේ.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 1.2 CLASS-WISE STUDENTS LIST SUB-TAB */}
            {studentSubTab === 'list' && (
              <div className="space-y-6">
                {/* Course Sub-Tabs / Pills */}
                <div className="flex flex-wrap items-center gap-2 bg-[#0c1322] p-2 rounded-2xl border border-slate-800">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedFilterCourse(course.id.toString())}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                        selectedFilterCourse === course.id.toString()
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-[#131c31] text-slate-400 hover:text-white'
                      }`}
                    >
                      📚 {course.title}
                    </button>
                  ))}
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0c1322] p-4 rounded-2xl border border-slate-800">
                  <div className="text-sm font-bold text-slate-200">
                    සිසුන් සංඛ්‍යාව: <span className="text-purple-400 font-mono">{filteredStudents.length}</span>
                  </div>
                  <div className="w-full sm:w-72">
                    <input
                      type="text"
                      placeholder="නම, Username හෝ Phone සොයන්න..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Students Table */}
                <div className="bg-[#0c1322] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                  {loadingStudents ? (
                    <div className="p-12 text-center text-slate-400 text-sm">සිසුන්ගේ තොරතුරු ලබාගනිමින් පවතී...</div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-sm">
                      මෙම පන්තියට තවමත් සිසුන් ලියාපදිංචි වී නොමැත.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-[#131c31] text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="py-3.5 px-4">ශිෂ්‍යයා (Student)</th>
                            <th className="py-3.5 px-4">Username</th>
                            <th className="py-3.5 px-4">දුරකථන අංකය</th>
                            <th className="py-3.5 px-4">උපාංගය (Device)</th>
                            <th className="py-3.5 px-4">වලංගු කාලය (Access)</th>
                            <th className="py-3.5 px-4 text-center">ක්‍රියාමාර්ග (Actions)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {filteredStudents.map((st) => {
                            const isExpired = st.validUntil && new Date(st.validUntil) < new Date();
                            const formattedDate = st.validUntil
                              ? new Date(st.validUntil).toLocaleDateString('si-LK', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'සීමාවක් නැත';

                            return (
                              <tr key={st.userId} className="hover:bg-slate-800/30 transition">
                                <td className="py-3.5 px-4 font-semibold text-white">
                                  {st.fullName}
                                </td>
                                <td className="py-3.5 px-4 font-mono text-purple-400">
                                  @{st.username}
                                </td>
                                <td className="py-3.5 px-4">
                                  {st.phone ? (
                                    <a
                                      href={`https://wa.me/94${st.phone.replace(/^0/, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-emerald-400 hover:underline flex items-center gap-1"
                                    >
                                      💬 {st.phone}
                                    </a>
                                  ) : (
                                    <span className="text-slate-600">-</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4">
                                  {st.deviceId ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-[10px]">
                                      🔒 Locked
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 text-[10px]">
                                      🔓 Unlocked
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex flex-col">
                                    <span className={`font-semibold ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                                      {isExpired ? '⛔ Expired' : '✅ Active'}
                                    </span>
                                    <span className="text-[10px] text-slate-500">{formattedDate} දක්වා</span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center justify-center gap-2">
                                    {/* Extend Access Button */}
                                    <button
                                      disabled={actionLoadingId === `extend_${st.userId}`}
                                      onClick={() => handleExtendAccess(st)}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
                                    >
                                      {actionLoadingId === `extend_${st.userId}` ? '...' : '+30 Days ගාස්තු සක්‍රිය'}
                                    </button>

                                    {/* Reset Device Button */}
                                    {st.deviceId && (
                                      <button
                                        disabled={actionLoadingId === `reset_${st.userId}`}
                                        onClick={() => handleResetDevice(st)}
                                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 transition text-[11px]"
                                        title="උපාංගය Reset කරන්න"
                                      >
                                        {actionLoadingId === `reset_${st.userId}` ? '...' : '🔄 Reset Device'}
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CLASSES & VIDEOS */}
        {activeTab === 'classes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#0c1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                <span>📹</span> සජීවී Zoom පන්තියක් සකස් කිරීම (Schedule Class)
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">අදාළ පාඨමාලාව (Target Course)</label>
                  <select className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white">
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">පාඩමේ මාතෘකාව</label>
                  <input type="text" placeholder="උදා: ප්‍රභාසංස්ලේෂණය - විශේෂ ප්‍රශ්න පත්‍ර සාකච්ඡාව" className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">දිනය</label>
                    <input type="date" className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">වේලාව</label>
                    <input type="time" className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Zoom Meeting Join Link</label>
                  <input type="url" placeholder="https://zoom.us/j/..." className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white" />
                </div>
                <button className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-xl text-sm font-semibold transition mt-2">
                  + මෙම පන්තිය පමණක් Publish කරන්න
                </button>
              </div>
            </div>

            <div className="bg-[#0c1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                <span>▶️</span> Bunny Video Recording එකක් එක් කිරීම
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">අදාළ පාඨමාලාව (Target Course)</label>
                  <select className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white">
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Recording මාතෘකාව</label>
                  <input type="text" placeholder="උදා: පාඩම 01: සම්පූර්ණ විවරණය" className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">පැවැත්වූ දිනය</label>
                  <input type="date" className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Bunny Video ID</label>
                  <input type="text" placeholder="d1234567-xxxx-xxxx-xxxx" className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white" />
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-sm font-semibold transition mt-2">
                  + Recording එක Playlist එකට දමන්න
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}