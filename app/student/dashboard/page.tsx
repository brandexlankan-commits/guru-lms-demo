'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Video, PlayCircle, Lock, ShieldAlert, Film, Clock, 
  Calendar, CheckCircle, Smartphone, ExternalLink, Sparkles,
  FileText, Download, Award, UploadCloud, Check, AlertCircle, File,
  LogOut
} from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [activeCourse, setActiveCourse] = useState<any | null>(null);

  // Active Main Tab: Videos / Tutes / Assignments
  const [activeTab, setActiveTab] = useState<'videos' | 'materials' | 'assignments'>('videos');

  // Course Data States
  const [liveClass, setLiveClass] = useState<any | null>(null);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [activeRecording, setActiveRecording] = useState<any | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Student Assignment Submission State
  const [submittingAssignId, setSubmittingAssignId] = useState<string | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [uploadingSubmission, setUploadingSubmission] = useState(false);

  // Floating Watermark position state
  const [watermarkPos, setWatermarkPos] = useState({ top: '30%', left: '40%' });

  useEffect(() => {
    fetchStudentData();

    // Watermark එක සෙමින් ස්ථාන මාරු වීම
    const interval = setInterval(() => {
      const randomTop = Math.floor(15 + Math.random() * 65) + '%';
      const randomLeft = Math.floor(10 + Math.random() * 60) + '%';
      setWatermarkPos({ top: randomTop, left: randomLeft });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchStudentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);

      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('*, courses(*)')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (enrollments && enrollments.length > 0) {
        const enrolledCourses = enrollments.map((e: any) => ({
          ...e.courses,
          enrollmentId: e.id,
          validUntil: e.valid_until,
        }));
        setCourses(enrolledCourses);
        const defaultCourse = enrolledCourses[0];
        setActiveCourse(defaultCourse);
        loadCourseContent(defaultCourse.id, user.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseContent = async (courseId: string, userId?: string) => {
    try {
      const targetUserId = userId || currentUser?.id;

      // 1. Fetch Live Class
      const { data: live } = await supabase
        .from('live_classes')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setLiveClass(live || null);

      // 2. Fetch Recordings
      const { data: recs } = await supabase
        .from('recordings')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      setRecordings(recs || []);
      if (recs && recs.length > 0) {
        setActiveRecording(recs[0]);
      } else {
        setActiveRecording(null);
      }

      // 3. Fetch Tutes / Materials (course_materials සහ materials යන දෙකෙන්ම fetch කිරීම)
      let matsData: any[] = [];
      const { data: mats } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (mats && mats.length > 0) {
        matsData = mats;
      } else {
        const { data: fallbackMats } = await supabase
          .from('materials')
          .select('*')
          .eq('course_id', courseId)
          .order('created_at', { ascending: false });
        if (fallbackMats && fallbackMats.length > 0) {
          matsData = fallbackMats;
        }
      }

      setMaterials(matsData);

      // 4. Fetch Assignments
      const { data: assigns } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      setAssignments(assigns || []);

      // 5. Fetch this student's submissions
      if (targetUserId) {
        const { data: userSubs } = await supabase
          .from('assignment_submissions')
          .select('*')
          .eq('student_id', targetUserId);

        setSubmissions(userSubs || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectCourse = (course: any) => {
    setActiveCourse(course);
    loadCourseContent(course.id);
  };

  const handleLogout = async () => {
    if (confirm('ඔබට පද්ධතියෙන් නික්මීමට (Log out) අවශ්‍ය බව සහතිකද?')) {
      await supabase.auth.signOut();
      router.push('/login');
    }
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    if (!submissionFile || !currentUser) {
      alert('කරුණාකර ඔබේ පිළිතුරු පත්‍රයේ PDF හෝ Image ගොනුවක් තෝරන්න.');
      return;
    }

    setUploadingSubmission(true);
    try {
      const fileExt = submissionFile.name.split('.').pop();
      const storagePath = `submissions/${assignmentId}_${currentUser.id}_${Date.now()}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from('lms-materials')
        .upload(storagePath, submissionFile, { cacheControl: '3600', upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('lms-materials')
        .getPublicUrl(storagePath);

      const { data: subData, error: dbErr } = await supabase
        .from('assignment_submissions')
        .upsert([
          {
            assignment_id: assignmentId,
            student_id: currentUser.id,
            submission_file_url: publicUrl,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (dbErr) throw dbErr;

      alert('ඔබගේ පිළිතුරු පත්‍රය සාර්ථකව භාරදෙන ලදී! (Submitted)');
      setSubmissions(prev => [subData, ...prev.filter(s => s.assignment_id !== assignmentId)]);
      setSubmittingAssignId(null);
      setSubmissionFile(null);
    } catch (err: any) {
      alert('භාරදීම අසාර්ථක විය: ' + err.message);
    } finally {
      setUploadingSubmission(false);
    }
  };

  const username = currentUser?.user_metadata?.username || currentUser?.email?.split('@')[0] || 'student';

  return (
    <div className="min-h-screen bg-[#070b14] text-white p-4 md:p-8 font-sans select-none">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 max-w-7xl mx-auto">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white border-2 border-purple-500/50 flex items-center justify-center shadow-xl shadow-purple-500/25 overflow-hidden shrink-0">
              <img 
                src="/logo.png" 
                alt="Learn ICT with Mano" 
                className="w-full h-full object-contain scale-[2.4] transform" 
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Learn ICT with Mano
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400">Student Portal • ආයුබෝවන්, <span className="text-purple-300 font-mono">@{username}</span></p>
            </div>
          </div>

          {/* Mobile Logout Button (Visible only on phone) */}
          <button
            onClick={handleLogout}
            className="sm:hidden p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer flex items-center gap-1 text-xs"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Course Pills and Desktop Logout Button */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
          <div className="flex flex-wrap gap-2">
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectCourse(c)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeCourse?.id === c.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-[#0c1322] border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                📖 {c.title}
              </button>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 text-xs font-semibold transition cursor-pointer shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto mt-6 space-y-6">
        
        {/* Course Info Banner */}
        {activeCourse && (
          <div className="bg-[#0c1322] border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{activeCourse.title}</h2>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                  {activeCourse.category} • {activeCourse.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                වලංගු කාලය: <strong className="text-emerald-400">
                  {activeCourse.validUntil ? new Date(activeCourse.validUntil).toLocaleDateString('si-LK') : 'Active'} දක්වා
                </strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> Access Active
              </span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-[#0c1322] p-1.5 rounded-2xl border border-slate-800 w-fit">
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'videos'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>🎥 වීඩියෝ සහ Live ({recordings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'materials'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>📑 ටියූට් සහ සටහන් ({materials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'assignments'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>📝 පැවරුම් (Assignments) ({assignments.length})</span>
          </button>
        </div>

        {/* TAB 1: VIDEOS & LIVE CLASS */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            {liveClass ? (
              <div className="bg-gradient-to-r from-purple-950/40 via-[#0c1322] to-[#131c31] border border-purple-500/40 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 animate-pulse">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      🔴 Live Zoom Class
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{liveClass.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-purple-400" /> {liveClass.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-purple-400" /> {liveClass.time}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={liveClass.zoom_join_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🎥 Zoom පන්තියට සම්බන්ධ වන්න</span>
                </a>
              </div>
            ) : (
              <div className="bg-[#0c1322] border border-slate-800 p-4 rounded-2xl text-center text-xs text-slate-500">
                මෙම පන්තියට මේ මොහොතේ සජීවී Zoom කාලසටහනක් නොමැත.
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* YouTube Protected Player */}
              <div className="lg:col-span-8 bg-[#0c1322] border border-slate-800/80 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Film className="w-5 h-5 text-red-500" />
                    <h3 className="font-bold text-sm">ආරක්ෂිත Class Recordings</h3>
                  </div>
                  <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full font-bold">
                    YouTube Package Data
                  </span>
                </div>

                <div 
                  className="relative aspect-video w-full rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-2xl"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {activeRecording ? (
                    <>
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${activeRecording.video_id}?rel=0&modestbranding=1&controls=1&showinfo=0&disablekb=0&fs=1`}
                        title={activeRecording.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />

                      {/* 🛡️ ANTI-CLICK SHIELDS */}
                      {/* 1. Header Shield */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-14 z-20 bg-transparent cursor-default" 
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                        onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); }}
                      />

                      {/* 2. Bottom-Left Shield (Copy Link Icon Block) */}
                      <div 
                        className="absolute bottom-0 left-0 w-28 h-14 z-20 bg-transparent cursor-default"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                        onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); }}
                      />

                      {/* 3. Bottom-Right Shield (YouTube Button Block) */}
                      <div 
                        className="absolute bottom-0 right-0 w-32 h-14 z-20 bg-transparent cursor-default"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                        onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); }}
                      />

                      {/* 💧 FAINT & ULTRA-TRANSLUCENT WATERMARK */}
                      <div 
                        className="absolute z-30 pointer-events-none transition-all duration-1000 ease-in-out select-none"
                        style={{ top: watermarkPos.top, left: watermarkPos.left }}
                      >
                        <div className="text-[11px] font-mono font-medium text-white/20 tracking-widest uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                          @{username} • Protected
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                      <PlayCircle className="w-12 h-12 text-slate-700" />
                      <p className="text-xs">මෙම පන්තියට අදාළ Recordings තවම එක් කර නැත.</p>
                    </div>
                  )}
                </div>

                {activeRecording && (
                  <div className="pt-2">
                    <h4 className="text-sm font-bold text-white">{activeRecording.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                      <span>📅 පැවැත්වූ දිනය: {activeRecording.lesson_date}</span>
                      <span>⏱️ කාලය: {activeRecording.duration || '2h 00m'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Recordings Playlist */}
              <div className="lg:col-span-4 bg-[#0c1322] border border-slate-800/80 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-sm">පාඩම් මාලාව ({recordings.length})</h3>
                  <span className="text-[10px] text-slate-500">Playlist</span>
                </div>

                <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                  {recordings.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">Recordings නොමැත.</div>
                  ) : (
                    recordings.map((rec) => (
                      <button
                        key={rec.id}
                        onClick={() => setActiveRecording(rec)}
                        className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer flex items-center gap-3 ${
                          activeRecording?.id === rec.id
                            ? 'bg-red-500/10 border-red-500/40 text-white'
                            : 'bg-[#131c31] border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <PlayCircle className={`w-5 h-5 shrink-0 ${activeRecording?.id === rec.id ? 'text-red-400' : 'text-slate-500'}`} />
                        <div className="overflow-hidden">
                          <h5 className="text-xs font-semibold line-clamp-1">{rec.title}</h5>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                            <span>📅 {rec.lesson_date}</span>
                            <span>⏱️ {rec.duration || '2h 00m'}</span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: TUTES & STUDY MATERIALS */}
        {activeTab === 'materials' && (
          <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span>පන්ති නිබන්ධන සහ සටහන් (Tutes & Handouts)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">ඔබේ පන්තියට අදාළ සියලුම නිබන්ධන මෙතැනින් කියවීමට හෝ Download කර මුද්‍රණය කරගත හැක.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                {materials.length} Materials
              </span>
            </div>

            {materials.length === 0 ? (
              <div className="p-16 rounded-xl bg-slate-900/30 border border-dashed border-slate-800 text-center space-y-2">
                <File className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-300">තවමත් නිබන්ධන එක් කර නොමැත</h4>
                <p className="text-xs text-slate-500">ගුරුතුමා විසින් නිබන්ධන upload කළ සැනින් මෙහි දිස්වනු ඇත.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materials.map((mat) => (
                  <div key={mat.id} className="p-5 rounded-2xl bg-[#131c31] border border-slate-800 hover:border-emerald-500/40 transition flex flex-col justify-between space-y-4 group">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition line-clamp-2">{mat.title}</h4>
                      {mat.description && (
                        <p className="text-xs text-slate-400 line-clamp-2">{mat.description}</p>
                      )}
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>📦 {mat.file_size || 'PDF'}</span>
                        <span>📅 {new Date(mat.created_at).toLocaleDateString('si-LK')}</span>
                      </div>
                      <a
                        href={mat.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
                      >
                        <Download className="w-4 h-4" />
                        <span>PDF එක Download කරන්න</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ASSIGNMENTS & DEADLINES */}
        {activeTab === 'assignments' && (
          <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>පැවරුම් සහ ඇගයීම් (Assignments & Submissions)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">පැවරුම් නියමිත Deadline එකට පෙර සිදු කර පිළිතුරු පත්‍ර මෙතැනින් Submit කරන්න.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                {assignments.length} Tasks
              </span>
            </div>

            {assignments.length === 0 ? (
              <div className="p-16 rounded-xl bg-slate-900/30 border border-dashed border-slate-800 text-center space-y-2">
                <Award className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-300">තවමත් Assignments ලබාදී නොමැත</h4>
                <p className="text-xs text-slate-500">නව පැවරුම් ලැබුණු පසු මෙහි දිස්වනු ඇත.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assign) => {
                  const isExpired = new Date(assign.due_date) < new Date();
                  const submission = submissions.find(s => s.assignment_id === assign.id);
                  const formattedDeadline = new Date(assign.due_date).toLocaleString('si-LK', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div key={assign.id} className="p-5 rounded-2xl bg-[#131c31] border border-slate-800 hover:border-slate-700 transition space-y-4">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{assign.title}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              submission 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : isExpired 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {submission ? '✅ Submitted' : isExpired ? '⛔ Closed (Late)' : '⏳ Open (Active)'}
                            </span>
                          </div>
                          {assign.description && (
                            <p className="text-xs text-slate-400">{assign.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-purple-300 bg-purple-500/10 px-3 py-1 rounded-xl border border-purple-500/20">
                            🎯 Marks: {assign.total_marks}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#0c1322] p-3 rounded-xl border border-slate-800/80">
                        <span className="flex items-center gap-1.5 font-semibold text-amber-300">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span>අවසන් දිනය (Deadline): {formattedDeadline}</span>
                        </span>

                        {assign.file_url && (
                          <a
                            href={assign.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>ප්‍රශ්න පත්‍රය (Download Paper PDF)</span>
                          </a>
                        )}
                      </div>

                      {/* Submission Area */}
                      <div className="pt-2 border-t border-slate-800">
                        {submission ? (
                          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs text-emerald-300">
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                              <span>ඔබ මෙම පැවරුම {new Date(submission.submitted_at).toLocaleDateString('si-LK')} දින සාර්ථකව භාරදී ඇත.</span>
                            </div>
                            <div className="flex items-center gap-3">
                              {submission.marks !== null && (
                                <span className="font-mono font-bold text-xs text-emerald-400">
                                  ලකුණු: {submission.marks} / {assign.total_marks}
                                </span>
                              )}
                              <a
                                href={submission.submission_file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>ඔබේ පිළිතුරු පත්‍රය බලන්න</span>
                              </a>
                            </div>
                          </div>
                        ) : isExpired ? (
                          <div className="text-xs text-red-400 flex items-center gap-1.5 p-2 bg-red-500/10 rounded-xl border border-red-500/20">
                            <AlertCircle className="w-4 h-4" />
                            <span>මෙම Assignment එක භාරදීමේ අවසන් දිනය (Deadline) ඉක්මවා ගොස් ඇත.</span>
                          </div>
                        ) : (
                          <div>
                            {submittingAssignId === assign.id ? (
                              <div className="p-4 rounded-xl bg-[#0c1322] border border-amber-500/40 space-y-3">
                                <h5 className="text-xs font-bold text-white">පිළිතුරු පත්‍රය Upload කරන්න (PDF හෝ Photo)</h5>
                                <input
                                  type="file"
                                  required
                                  accept=".pdf,image/*"
                                  onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                                  className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-600/20 file:text-amber-400 hover:file:bg-amber-600/30 cursor-pointer bg-[#131c31] border border-slate-700 rounded-xl p-2"
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleSubmitAssignment(assign.id)}
                                    disabled={uploadingSubmission}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-lg shadow-amber-600/20 disabled:opacity-50 flex items-center gap-1.5"
                                  >
                                    <UploadCloud className="w-4 h-4" />
                                    <span>{uploadingSubmission ? 'Upload වෙමින් පවතී...' : 'පිළිතුරු පත්‍රය Submit කරන්න'}</span>
                                  </button>
                                  <button
                                    onClick={() => { setSubmittingAssignId(null); setSubmissionFile(null); }}
                                    className="px-3 py-2 bg-slate-800 text-slate-400 hover:text-white text-xs rounded-xl transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSubmittingAssignId(assign.id)}
                                className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                              >
                                <UploadCloud className="w-4 h-4" />
                                <span>📤 පිළිතුරු පත්‍රය භාරදෙන්න (Submit Answer)</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}