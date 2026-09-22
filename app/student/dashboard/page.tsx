'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Video, PlayCircle, FileText, Bell, LogOut, 
  ShieldAlert, Clock, Loader2, Play, 
  ExternalLink, Download, AlertCircle, BookOpen, ChevronDown,
  CreditCard, UploadCloud, X, CheckCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [deviceBlocked, setDeviceBlocked] = useState(false);
  
  // Courses States (handles both string UUIDs and Numbers)
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | number | null>(null);

  // Tabs State
  const [activeTab, setActiveTab] = useState<'classes' | 'assignments' | 'notices'>('classes');

  // Course-specific Content States
  const [liveClass, setLiveClass] = useState<any>(null);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);

  // Slip Modal States
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [selectedCourseForSlip, setSelectedCourseForSlip] = useState<string>('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);

  // Dynamic Floating Watermark
  const [watermarkPos, setWatermarkPos] = useState({ top: '20%', left: '30%' });

  useEffect(() => {
    const interval = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 70) + 15;
      const randomLeft = Math.floor(Math.random() * 60) + 10;
      setWatermarkPos({ top: `${randomTop}%`, left: `${randomLeft}%` });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadCourseContent = async (courseId: string | number) => {
    // 1. Live Class
    const { data: classData } = await supabase
      .from('live_classes')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setLiveClass(classData || null);

    // 2. Recordings
    const { data: recData } = await supabase
      .from('recordings')
      .select('*')
      .eq('course_id', courseId)
      .order('lesson_date', { ascending: false });

    if (recData && recData.length > 0) {
      setRecordings(recData);
      setSelectedVideo(recData[0]);
    } else {
      setRecordings([]);
      setSelectedVideo(null);
    }

    // 3. Assignments
    const { data: assignData } = await supabase
      .from('assignments')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });
    setAssignments(assignData || []);

    // 4. Notices
    const { data: noticeData } = await supabase
      .from('notices')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });
    setNotices(noticeData || []);
  };

  const fetchEnrolledCourses = async (userId: string) => {
    // user_id හෝ student_id දෙකෙන් කුමන column එක තිබුණත් enrollments සොයාගැනීම
    let myCourses: any[] = [];

    const { data: enrollDataUser } = await supabase
      .from('course_enrollments')
      .select('course_id, courses(*)')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (enrollDataUser && enrollDataUser.length > 0) {
      myCourses = enrollDataUser
        .map((e: any) => (Array.isArray(e.courses) ? e.courses[0] : e.courses))
        .filter(Boolean);
    } else {
      const { data: enrollDataStudent } = await supabase
        .from('course_enrollments')
        .select('course_id, courses(*)')
        .eq('student_id', userId)
        .eq('status', 'active');

      if (enrollDataStudent && enrollDataStudent.length > 0) {
        myCourses = enrollDataStudent
          .map((e: any) => (Array.isArray(e.courses) ? e.courses[0] : e.courses))
          .filter(Boolean);
      }
    }

    if (myCourses.length > 0) {
      setEnrolledCourses(myCourses);
      const firstCourseId = myCourses[0].id;
      setSelectedCourseId(firstCourseId);
      await loadCourseContent(firstCourseId);
    } else {
      setEnrolledCourses([]);
      setSelectedCourseId(null);
    }
  };

  useEffect(() => {
    let deviceChannel: any;
    let classChannel: any;

    const initDashboard = async () => {
      // 1. Session එක පරීක්ෂා කිරීම
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const userId = session.user.id;

      // 2. Profile එක ලබාගැනීම (Failsafe සහිතව)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // Profile Table එකෙන් නොලැබුණත් Auth User Metadata එකෙන් ශිෂ්‍යයාගේ නම සකසයි (Kick-out නොවේ)
      const currentStudent = profile || {
        id: userId,
        full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.username || 'ශිෂ්‍යයා',
        username: session.user.user_metadata?.username || '',
        email: session.user.email,
        current_device_id: localStorage.getItem('guru_device_id'),
      };
      setStudent(currentStudent);

      // 3. Single-Device Check
      let localDeviceId = localStorage.getItem('guru_device_id');
      if (!localDeviceId) {
        localDeviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        localStorage.setItem('guru_device_id', localDeviceId);
      }

      if (profile?.current_device_id && profile.current_device_id !== localDeviceId) {
        setDeviceBlocked(true);
        await supabase.auth.signOut();
        return;
      }

      // 4. Enroll වූ පන්ති ලබාගැනීම
      await fetchEnrolledCourses(userId);

      // 5. සියලුම පන්ති ලබාගැනීම (Slip modal එක සඳහා)
      const { data: allCoursesData } = await supabase
        .from('courses')
        .select('*')
        .order('category', { ascending: true });

      if (allCoursesData && allCoursesData.length > 0) {
        setAllCourses(allCoursesData);
        setSelectedCourseForSlip(allCoursesData[0].id.toString());
      }

      setLoading(false);

      // Realtime Device Check
      deviceChannel = supabase
        .channel(`public:profiles:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${userId}`,
          },
          (payload: any) => {
            const updatedDeviceId = payload.new.current_device_id;
            const myDeviceId = localStorage.getItem('guru_device_id');
            if (updatedDeviceId && updatedDeviceId !== myDeviceId) {
              setDeviceBlocked(true);
              supabase.auth.signOut();
            }
          }
        )
        .subscribe();

      // Realtime Live Class
      classChannel = supabase
        .channel('public:live_classes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'live_classes' },
          () => {
            if (selectedCourseId) loadCourseContent(selectedCourseId);
          }
        )
        .subscribe();
    };

    initDashboard();

    return () => {
      if (deviceChannel) supabase.removeChannel(deviceChannel);
      if (classChannel) supabase.removeChannel(classChannel);
    };
  }, [router]);

  const handleCourseChange = (courseId: string | number) => {
    setSelectedCourseId(courseId);
    loadCourseContent(courseId);
  };

  // Submit Bank Slip Function
  const handleSubmitSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipFile) {
      alert('කරුණාකර බැංකු රිසිට්පත තෝරන්න (Select Slip Image / PDF).');
      return;
    }

    const courseObj = allCourses.find((c: any) => c.id.toString() === selectedCourseForSlip);
    if (!courseObj) return;

    setUploadingSlip(true);
    try {
      const fileExt = slipFile.name.split('.').pop();
      const fileName = `${student.id}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('slips')
        .upload(filePath, slipFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('slips')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('bank_slips').insert([
        {
          student_id: student.id,
          course_id: courseObj.id,
          course_name: courseObj.title,
          amount: courseObj.monthly_fee,
          slip_url: publicUrl,
          status: 'pending'
        }
      ]);

      if (dbError) throw dbError;

      await supabase.from('course_enrollments').upsert(
        {
          user_id: student.id,
          course_id: courseObj.id,
          status: 'pending'
        }
      );

      alert('බැංකු රිසිට්පත සාර්ථකව යොමු කරන ලදී! ගුරුවරයා විසින් එය අනුමත කළ පසු ඔබට මෙම පන්තියට ක්ෂණිකව ප්‍රවේශ විය හැක.');
      setShowSlipModal(false);
      setSlipFile(null);
    } catch (err: any) {
      alert('දෝෂයක් සිදුවිය: ' + err.message);
    } finally {
      setUploadingSlip(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('guru_device_id');
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (deviceBlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">උපාංග ආරක්ෂණ අනතුරු ඇඟවීමයි!</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            ඔබගේ ගිණුම වෙනත් දුරකථනයකින් හෝ පරිගණකයකින් Login කර ඇත. එක් ගිණුමක් එකවර භාවිතා කළ හැක්කේ එක් උපාංගයකින් පමණි.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            නැවත Login වන්න
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const currentCourse = enrolledCourses.find((c: any) => c.id.toString() === selectedCourseId?.toString());
  const targetSlipCourse = allCourses.find((c: any) => c.id.toString() === selectedCourseForSlip);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              AL
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide">A/L Master LMS</div>
              <div className="text-[10px] text-slate-400">{student?.full_name || student?.username}</div>
            </div>
          </div>

          {/* Enrolled Courses Switcher */}
          {enrolledCourses.length > 0 && (
            <div className="relative">
              <select
                value={selectedCourseId?.toString() || ''}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="bg-slate-950 border border-blue-500/40 text-blue-300 rounded-xl px-3.5 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer pr-8 appearance-none shadow-md shadow-blue-500/10"
              >
                {enrolledCourses.map((c: any) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    [{c.category || 'Class'}] {c.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-blue-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('classes')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'classes' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Live & Recordings</span>
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'assignments' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Assignments & Tutes</span>
            </button>
            <button
              onClick={() => setActiveTab('notices')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'notices' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notices</span>
            </button>
          </div>

          {/* Fee Payment Button & Logout */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSlipModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>ගාස්තු ගෙවීම / Slip</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition border border-slate-700/50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">

        {/* If Not Enrolled in Any Course */}
        {enrolledCourses.length === 0 && (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20">
              <BookOpen className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white">ඔබ තවමත් කිසිදු පන්තියකට ලියාපදිංචි වී නොමැත</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              ඔබට අවශ්‍ය පන්තිය තෝරා, පන්ති ගාස්තු ගෙවූ රිසිට්පත යොමු කිරීමෙන් ක්ෂණිකව පන්ති සමඟ සම්බන්ධ විය හැක.
            </p>
            <button
              onClick={() => setShowSlipModal(true)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              පන්තියක් තෝරා Slip එක Upload කරන්න
            </button>
          </div>
        )}

        {/* Current Course Info Banner */}
        {currentCourse && (
          <div className="flex items-center justify-between bg-slate-900/40 border border-slate-800/80 rounded-2xl px-5 py-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>වත්මන් පන්තිය: <strong className="text-white">{currentCourse.title}</strong></span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] uppercase font-bold">
                {currentCourse.category || 'A/L'} • {currentCourse.type || 'Theory'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">ගාස්තුව: Rs. {currentCourse.monthly_fee || '2500'}/-</span>
          </div>
        )}

        {/* TAB 1: LIVE & RECORDINGS */}
        {currentCourse && activeTab === 'classes' && (
          <div className="space-y-6">
            {liveClass ? (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-slate-900 border border-blue-500/30 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    LIVE ZOOM CLASS READY
                  </span>
                  <h1 className="text-xl md:text-2xl font-bold text-white">{liveClass.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" /> {liveClass.date} • {liveClass.time}
                    </span>
                  </div>
                </div>

                <a
                  href={liveClass.zoom_join_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Live Zoom Class</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-500 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-300">මෙම පන්තියට දැනට සජීවී කාලසටහනක් නොමැත</h3>
                <p className="text-xs text-slate-500">ගුරුතුමා විසින් අලුත් Zoom පන්තියක් Schedule කළ සැනින් මෙහි දිස්වනු ඇත.</p>
              </div>
            )}

            {/* Video Player & Recordings List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-blue-400" />
                    ආරක්ෂිත Class Recordings (Dynamic Watermark Protection)
                  </h2>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    DRM Secured
                  </span>
                </div>

                <div className="relative aspect-video rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl">
                  {/* Dynamic Floating Watermark showing Student Username */}
                  <div 
                    className="absolute pointer-events-none transition-all duration-1000 ease-in-out font-mono font-bold text-[12px] text-white/20 select-none z-30"
                    style={{ top: watermarkPos.top, left: watermarkPos.left }}
                  >
                    {student?.username || student?.full_name || 'STUDENT'} • IP Protected
                  </div>

                  <div className="text-center space-y-3 z-10">
                    <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                      <Play className="w-7 h-7 fill-blue-400 ml-1" />
                    </div>
                    <div className="text-sm font-semibold text-slate-200">
                      {selectedVideo ? selectedVideo.title : 'මෙම පන්තියට අදාළ Recordings තවම එක් කර නැත'}
                    </div>
                    {selectedVideo && (
                      <div className="text-[11px] text-slate-500 font-mono">
                        Duration: {selectedVideo.duration || '2h 30m'} • 1080p Stream
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Playlist */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {currentCourse?.title} Recordings ({recordings.length})
                </h3>
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {recordings.length === 0 ? (
                    <div className="text-xs text-slate-600 py-8 text-center">Recordings නොමැත</div>
                  ) : (
                    recordings.map((rec: any) => (
                      <div
                        key={rec.id}
                        onClick={() => setSelectedVideo(rec)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                          selectedVideo?.id === rec.id
                            ? 'bg-blue-600/10 border-blue-500/40 text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="space-y-1 pr-2">
                          <div className="text-xs font-semibold line-clamp-1">{rec.title}</div>
                          <div className="text-[10px] text-slate-500">{rec.lesson_date} • {rec.duration || '2h 30m'}</div>
                        </div>
                        <PlayCircle className={`w-4 h-4 shrink-0 ${selectedVideo?.id === rec.id ? 'text-blue-400' : 'text-slate-600'}`} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ASSIGNMENTS */}
        {currentCourse && activeTab === 'assignments' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              {currentCourse?.title} - Assignments & Tutes
            </h2>
            {assignments.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">මෙම පන්තියට තවම Tutes එක් කර නැත.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assignments.map((item: any) => (
                  <div key={item.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                    <h3 className="text-base font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                    <a href={item.file_url} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl transition">
                      <Download className="w-4 h-4 text-blue-400" />
                      <span>Download Tute (PDF)</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NOTICES */}
        {currentCourse && activeTab === 'notices' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400" />
              {currentCourse?.title} - නිවේදන
            </h2>
            {notices.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">මෙම පන්තිය සඳහා විශේෂ නිවේදන නොමැත.</div>
            ) : (
              <div className="space-y-4 max-w-4xl">
                {notices.map((notice: any) => (
                  <div key={notice.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl relative overflow-hidden">
                    <div className="w-1.5 h-full bg-blue-600 absolute left-0 top-0"></div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-blue-400 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> පන්ති නිවේදනය</span>
                      <span>{notice.created_at}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{notice.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{notice.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ================= BANK SLIP UPLOAD MODAL ================= */}
      {showSlipModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowSlipModal(false)}
              className="absolute right-5 top-5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-400" />
                පන්ති ගාස්තු ගෙවීම සහ ලියාපදිංචිය
              </h3>
              <p className="text-xs text-slate-400">අදාළ පන්තිය තෝරා බැංකු රිසිට්පත (Bank Slip) මෙතැනට Upload කරන්න.</p>
            </div>

            {/* Bank Details Card */}
            <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-xs space-y-1.5 text-slate-300">
              <div className="font-bold text-blue-400 uppercase tracking-wider text-[10px]">ගුරුතුමාගේ බැංකු ගිණුම් විස්තර</div>
              <div>බැංකුව: <strong>Commercial Bank</strong></div>
              <div>ගිණුම් අංකය: <strong className="font-mono text-white text-sm">8001234567</strong></div>
              <div>නම: <strong>A/L Master Science Academy</strong></div>
              <div className="text-[11px] text-slate-400">ශාඛාව: කොළඹ ප්‍රධාන ශාඛාව (හෝ Online Transfer)</div>
            </div>

            <form onSubmit={handleSubmitSlip} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">ගාස්තු ගෙවන පන්තිය (Select Course)</label>
                <select
                  value={selectedCourseForSlip}
                  onChange={(e) => setSelectedCourseForSlip(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-blue-500 outline-none cursor-pointer"
                >
                  {allCourses.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      [{c.category || 'Class'} • {c.type ? c.type.toUpperCase() : 'THEORY'}] {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {targetSlipCourse && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                  <span className="text-slate-400">මාසික පන්ති ගාස්තුව:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">Rs. {targetSlipCourse.monthly_fee || '2500'}/-</span>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">බැංකු රිසිට්පත (Bank Slip / Screenshot)</label>
                <label className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-slate-950/40">
                  <UploadCloud className="w-7 h-7 text-blue-400" />
                  <span className="text-xs text-slate-300 font-medium">
                    {slipFile ? slipFile.name : 'රිසිට්පත් ඡායාරූපය මෙතැනින් තෝරන්න'}
                  </span>
                  <span className="text-[10px] text-slate-500">JPG, PNG, WebP හෝ PDF (Max 10MB)</span>
                  <input
                    type="file"
                    required
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSlipFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={uploadingSlip}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                {uploadingSlip ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Upload වෙමින් පවතී...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>රිසිට්පත යොමු කරන්න (Submit Slip)</span>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}