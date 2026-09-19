'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Video, PlayCircle, Users, CheckCircle, 
  LogOut, Plus, Clock, ExternalLink, RefreshCw, Loader2, Shield, Trash2, Calendar, BookOpen, Layers, XCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'classes' | 'courses' | 'slips' | 'students'>('classes');

  // Courses State
  const [courses, setCourses] = useState<any[]>([]);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('Grade 7');
  const [newCourseType, setNewCourseType] = useState('theory');
  const [newCourseFee, setNewCourseFee] = useState('2000');
  const [creatingCourse, setCreatingCourse] = useState(false);

  // Live Class Form State
  const [selectedCourseForClass, setSelectedCourseForClass] = useState<string>('');
  const [classTitle, setClassTitle] = useState('');
  const [classDate, setClassDate] = useState('');
  const [classTime, setClassTime] = useState('20:00');
  const [zoomUrl, setZoomUrl] = useState('');
  const [savingClass, setSavingClass] = useState(false);

  // Recording Form State
  const [selectedCourseForRec, setSelectedCourseForRec] = useState<string>('');
  const [recTitle, setRecTitle] = useState('');
  const [recDate, setRecDate] = useState('');
  const [bunnyId, setBunnyId] = useState('');

  // Data States
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [slips, setSlips] = useState<any[]>([]);

  useEffect(() => {
    const initAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
        router.push('/student/dashboard');
        return;
      }
      setTeacher(profile);

      await fetchAdminData();
      setLoading(false);
    };

    initAdmin();
  }, [router]);

  const fetchAdminData = async () => {
    // 1. Fetch Courses
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (coursesData && coursesData.length > 0) {
      setCourses(coursesData);
      if (!selectedCourseForClass) setSelectedCourseForClass(coursesData[0].id.toString());
      if (!selectedCourseForRec) setSelectedCourseForRec(coursesData[0].id.toString());
    }

    // 2. Fetch Live Classes
    const { data: classData } = await supabase
      .from('live_classes')
      .select('*, courses(title, category, type)')
      .order('created_at', { ascending: false });
    if (classData) setLiveClasses(classData);

    // 3. Fetch Slips with Student Details
    const { data: slipsData } = await supabase
      .from('bank_slips')
      .select('*, profiles(full_name, email, batch)')
      .order('submitted_at', { ascending: false });
    if (slipsData) setSlips(slipsData);

    // 4. Fetch Students
    const { data: studentsData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false });
    if (studentsData) setStudents(studentsData);
  };

  // Create Course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCourse(true);

    const { error } = await supabase.from('courses').insert([
      {
        title: newCourseTitle,
        category: newCourseCategory,
        type: newCourseType,
        monthly_fee: Number(newCourseFee)
      }
    ]);

    setCreatingCourse(false);
    if (!error) {
      alert('පාඨමාලාව සාර්ථකව නිර්මාණය කරන ලදී!');
      setNewCourseTitle('');
      fetchAdminData();
    } else {
      alert('දෝෂයක්: ' + error.message);
    }
  };

  // Create Live Class
  const handleCreateLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForClass) {
      alert('කරුණාකර අදාළ පාඨමාලාව තෝරන්න.');
      return;
    }
    setSavingClass(true);

    const { error } = await supabase.from('live_classes').insert([
      {
        course_id: Number(selectedCourseForClass),
        title: classTitle,
        date: classDate,
        time: classTime,
        zoom_join_url: zoomUrl,
        status: 'scheduled'
      }
    ]);

    setSavingClass(false);
    if (!error) {
      alert('සජීවී පන්තිය තෝරාගත් Course එකට සාර්ථකව පලකරන ලදී!');
      setClassTitle('');
      setZoomUrl('');
      fetchAdminData();
    } else {
      alert('දෝෂයක්: ' + error.message);
    }
  };

  // Add Bunny Recording
  const handleAddRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForRec) {
      alert('කරුණාකර අදාළ පාඨමාලාව තෝරන්න.');
      return;
    }

    const { error } = await supabase.from('recordings').insert([
      {
        course_id: Number(selectedCourseForRec),
        title: recTitle,
        lesson_date: recDate,
        bunny_video_id: bunnyId,
        duration: '2h 30m'
      }
    ]);

    if (!error) {
      alert('Recording එක සාර්ථකව එක් කරන ලදී!');
      setRecTitle('');
      setBunnyId('');
    } else {
      alert('දෝෂයක්: ' + error.message);
    }
  };

  // Delete Live Class
  const handleDeleteClass = async (id: number) => {
    if (confirm('මෙම පන්තිය මකා දැමීමට අවශ්‍ය බව සහතිකද?')) {
      await supabase.from('live_classes').delete().eq('id', id);
      fetchAdminData();
    }
  };

  // APPROVE BANK SLIP & ENROLL STUDENT TO COURSE
  const handleApproveSlip = async (slipId: number, studentId: string, courseId?: number) => {
    // 1. Mark slip as approved
    await supabase.from('bank_slips').update({ status: 'approved' }).eq('id', slipId);

    // 2. Activate in course_enrollments
    if (courseId) {
      await supabase.from('course_enrollments').upsert(
        {
          student_id: studentId,
          course_id: courseId,
          status: 'active'
        },
        { onConflict: 'student_id,course_id' }
      );
    }

    // 3. Mark profile active
    await supabase.from('profiles').update({ is_active: true }).eq('id', studentId);

    alert('ගෙවීම අනුමත කරන ලදී! ශිෂ්‍යයා මෙම පන්තියට (Course) සාර්ථකව Enroll විය.');
    fetchAdminData();
  };

  // REJECT BANK SLIP
  const handleRejectSlip = async (slipId: number, studentId: string, courseId?: number) => {
    if (confirm('මෙම රිසිට්පත ප්‍රතික්ෂේප කිරීමට අවශ්‍ය බව සහතිකද?')) {
      await supabase.from('bank_slips').update({ status: 'rejected' }).eq('id', slipId);
      if (courseId) {
        await supabase.from('course_enrollments').delete().match({ student_id: studentId, course_id: courseId });
      }
      alert('රිසිට්පත ප්‍රතික්ෂේප කරන ලදී.');
      fetchAdminData();
    }
  };

  // Reset Student Device
  const handleResetDevice = async (studentId: string) => {
    await supabase.from('profiles').update({ current_device_id: null }).eq('id', studentId);
    alert('ශිෂ්‍යයාගේ Device Lock එක ඉවත් කරන ලදී!');
    fetchAdminData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Admin Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Teacher Admin Portal</div>
              <div className="text-[10px] text-purple-400 font-medium">{teacher?.full_name}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'classes' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Classes & Videos
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'courses' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Courses / පන්ති
            </button>
            <button
              onClick={() => setActiveTab('slips')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer relative ${
                activeTab === 'slips' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Slip Approvals</span>
              {slips.filter(s => s.status === 'pending').length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-red-500 text-white text-[10px] rounded-full font-bold">
                  {slips.filter(s => s.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'students' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Devices
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition border border-slate-700/50 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 pt-8 space-y-8">

        {/* TAB 1: CLASSES & RECORDINGS */}
        {activeTab === 'classes' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Live Class Publisher */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <Video className="w-4 h-4" />
                  <span>සජීවී Zoom පන්තියක් සකස් කිරීම (Schedule Class)</span>
                </div>

                <form onSubmit={handleCreateLiveClass} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">අදාළ පාඨමාලාව (Target Course)</label>
                    <select
                      value={selectedCourseForClass}
                      onChange={(e) => setSelectedCourseForClass(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-purple-500 outline-none"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.category} - {c.type.toUpperCase()}] {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">පාඩමේ මාතෘකාව</label>
                    <input
                      type="text"
                      required
                      value={classTitle}
                      onChange={(e) => setClassTitle(e.target.value)}
                      placeholder="ප්‍රභාසංස්ලේෂණය - විශේෂ ප්‍රශ්න පත්‍ර සාකච්ඡාව"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-purple-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">දිනය</label>
                      <input
                        type="date"
                        required
                        value={classDate}
                        onChange={(e) => setClassDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">වේලාව</label>
                      <input
                        type="time"
                        required
                        value={classTime}
                        onChange={(e) => setClassTime(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-purple-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Zoom Meeting Join Link</label>
                    <input
                      type="url"
                      required
                      value={zoomUrl}
                      onChange={(e) => setZoomUrl(e.target.value)}
                      placeholder="https://zoom.us/j/987654321..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-purple-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingClass}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>මෙම පන්තියට පමණක් Publish කරන්න</span>
                  </button>
                </form>
              </div>

              {/* Add Bunny Stream Recording */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                  <PlayCircle className="w-4 h-4" />
                  <span>Bunny Video Recording එකක් එක් කිරීම</span>
                </div>

                <form onSubmit={handleAddRecording} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">අදාළ පාඨමාලාව (Target Course)</label>
                    <select
                      value={selectedCourseForRec}
                      onChange={(e) => setSelectedCourseForRec(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.category} - {c.type.toUpperCase()}] {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Recording මාතෘකාව</label>
                    <input
                      type="text"
                      required
                      value={recTitle}
                      onChange={(e) => setRecTitle(e.target.value)}
                      placeholder="පාඩම 01: සම්පූර්ණ විවරණය"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">පැවැත්වූ දිනය</label>
                    <input
                      type="date"
                      required
                      value={recDate}
                      onChange={(e) => setRecDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Bunny Video ID</label>
                    <input
                      type="text"
                      required
                      value={bunnyId}
                      onChange={(e) => setBunnyId(e.target.value)}
                      placeholder="d1234567-xxxx-xxxx-xxxx"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Recording එක Playlist එකට දමන්න</span>
                  </button>
                </form>
              </div>
            </div>

            {/* SCHEDULED CLASSES LIST TABLE */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                දැනට Schedule කර ඇති පන්ති (Scheduled Live Classes)
              </h3>

              {liveClasses.length === 0 ? (
                <div className="text-xs text-slate-500 py-6 text-center">කිසිදු සජීවී පන්තියක් Schedule කර නැත.</div>
              ) : (
                <div className="space-y-3">
                  {liveClasses.map((cls) => (
                    <div key={cls.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                            {cls.courses?.category || 'General'}
                          </span>
                          <span className="text-sm font-semibold text-white">{cls.title}</span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-3">
                          <span className="text-slate-500 text-[11px]">({cls.courses?.title})</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-purple-400" /> {cls.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-400" /> {cls.time}</span>
                          <a href={cls.zoom_join_url} target="_blank" className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]">
                            <span>Zoom Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteClass(cls.id)}
                        className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer border border-red-500/20"
                        title="මකා දමන්න"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: COURSES MANAGEMENT */}
        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl h-fit">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                අලුත් පන්තියක් / Course එකක් සෑදීම
              </h3>

              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Course එකේ නම (Title)</label>
                  <input
                    type="text"
                    required
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    placeholder="Grade 8 Science - Paper Class"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-purple-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">ශ්‍රේණිය (Category)</label>
                    <select
                      value={newCourseCategory}
                      onChange={(e) => setNewCourseCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 outline-none"
                    >
                      <option value="Grade 7">Grade 7</option>
                      <option value="Grade 8">Grade 8</option>
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11 (O/L)">Grade 11 (O/L)</option>
                      <option value="2026 A/L">2026 A/L</option>
                      <option value="2027 A/L">2027 A/L</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">වර්ගය (Type)</label>
                    <select
                      value={newCourseType}
                      onChange={(e) => setNewCourseType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 outline-none"
                    >
                      <option value="theory">Theory</option>
                      <option value="paper">Paper Class</option>
                      <option value="revision">Revision</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">මාසික පන්ති ගාස්තුව (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={newCourseFee}
                    onChange={(e) => setNewCourseFee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:border-purple-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingCourse}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Course එක Add කරන්න</span>
                </button>
              </form>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                දැනට පවතින සක්‍රීය පාඨමාලා ({courses.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {courses.map((c) => (
                  <div key={c.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase">
                        {c.category} • {c.type}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">Rs. {c.monthly_fee}</span>
                    </div>
                    <div className="text-sm font-bold text-white">{c.title}</div>
                    <div className="text-[11px] text-slate-500">Course ID: #{c.id}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SLIP APPROVALS QUEUE */}
        {activeTab === 'slips' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              බැංකු රිසිට්පත් අනුමත කිරීම (Bank Slip Approval Queue)
            </h2>

            {slips.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">අනුමත කිරීමට කිසිදු රිසිට්පතක් නැත.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">ශිෂ්‍යයා</th>
                      <th className="py-3 px-4">පාඨමාලාව</th>
                      <th className="py-3 px-4">මුදල</th>
                      <th className="py-3 px-4">රිසිට්පත</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">ක්‍රියාමාර්ග</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {slips.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{s.profiles?.full_name}</div>
                          <div className="text-[10px] text-slate-500">{s.profiles?.email}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-200">{s.course_name}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">Rs. {s.amount}</td>
                        <td className="py-3 px-4">
                          <a
                            href={s.slip_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 flex items-center gap-1.5 underline"
                          >
                            <span>බලන්න (View Slip)</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : s.status === 'rejected'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {s.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {s.status === 'pending' ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApproveSlip(s.id, s.student_id, s.course_id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-md shadow-emerald-600/20"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectSlip(s.id, s.student_id, s.course_id)}
                                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg text-xs font-bold transition cursor-pointer border border-red-500/30"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-mono">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STUDENTS & DEVICES */}
        {activeTab === 'students' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              ලියාපදිංචි සිසුන් සහ Device Locks
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">නම</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">තත්වය</th>
                    <th className="py-3 px-4">Device ID Lock</th>
                    <th className="py-3 px-4">Device Reset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-white">{st.full_name}</td>
                      <td className="py-3 px-4">{st.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          st.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {st.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {st.current_device_id ? (
                          <span className="text-blue-400">{st.current_device_id.substring(0, 14)}...</span>
                        ) : (
                          <span className="text-slate-600">No Device Locked</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleResetDevice(st.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition cursor-pointer border border-slate-700"
                        >
                          <RefreshCw className="w-3 h-3 text-amber-400" />
                          <span>Reset</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}