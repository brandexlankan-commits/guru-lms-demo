'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'classes' | 'courses' | 'slips' | 'devices' | 'students'>('students');

  // Courses state
  const [courses, setCourses] = useState<any[]>([]);

  // Add Student Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [createdStudentData, setCreatedStudentData] = useState<any>(null);

  // Initial Load
  useEffect(() => {
    fetchCourses();
    generateRandomPassword();
  }, []);

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setCourses(data);
    } else {
      // Fallback demo courses if table is empty
      setCourses([
        { id: 'c1', title: 'Grade 7 Science - Theory Masterclass' },
        { id: 'c2', title: 'Grade 7 Science - Paper Class' },
        { id: 'c3', title: 'Grade 8 Science - Full Syllabus' }
      ]);
    }
  };

  // Generate unique random password
  const generateRandomPassword = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setPassword(`Guru#${randomDigits}`);
  };

  // Auto-generate username from Full Name
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

  // Handle Create Student Submission
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (selectedCourses.length === 0) {
      setFormError('කරුණාකර ශිෂ්‍යයා සඳහා අවම වශයෙන් එක් පන්තියක්වත් තෝරන්න.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Corrected API endpoint matching app/api/create-student/route.ts
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

      // Success
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

      // Clear Form
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
                {/* Full Name */}
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
                  {/* Username (Auto-Generated) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Username (Login සඳහා) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="kasun482"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-3 text-sm text-purple-300 font-mono focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>

                  {/* WhatsApp Number */}
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

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-slate-300">තාවකාලික මුරපදය (Password) *</label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-xs text-purple-400 hover:underline"
                    >
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

                {/* Multi-Course Selection Checkboxes */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    සම්බන්ධ වන පන්ති තෝරන්න (Select Courses) *
                  </label>
                  <div className="space-y-2.5 bg-[#131c31] p-4 rounded-xl border border-slate-800">
                    {courses.map((course) => (
                      <label
                        key={course.id}
                        className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-800/50 transition"
                      >
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-purple-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'ශිෂ්‍යයා ලියාපදිංචි වෙමින් පවතී...' : '+ ශිෂ්‍යයා ලියාපදිංචි කර ඇතුළත් කරන්න'}
                </button>
              </form>
            </div>

            {/* WhatsApp Ready Output Preview */}
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

        {/* TAB 2: CLASSES & VIDEOS */}
        {activeTab === 'classes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#0c1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                <span>📹</span> සජීවී Zoom පන්තියක් සකස් කිරීම (Schedule Class)
              </h2>
              <p className="text-xs text-slate-400 mb-6">පන්ති පැවැත්වෙන දිනය, වේලාව සහ Zoom link එක ඇතුළත් කර Publish කරන්න.</p>
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
              <p className="text-xs text-slate-400 mb-6">පසුගිය පන්ති වල Video Recordings ආරක්ෂිතව සිසුන්ට නැරඹීමට ලබා දෙන්න.</p>
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