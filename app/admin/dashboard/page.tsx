'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BookOpen, Video, Users, Plus, Trash2, ArrowLeft, 
  Calendar, Clock, Link as LinkIcon, Film, PlayCircle,
  CheckCircle, AlertCircle, X, Shield, RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'classes' | 'courses' | 'slips' | 'devices' | 'students'>('courses');

  // Sub-tabs inside Students Tab
  const [studentSubTab, setStudentSubTab] = useState<'register' | 'list'>('register');

  // Courses state
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedFilterCourse, setSelectedFilterCourse] = useState<string>('');

  // Course Hub Management States
  const [selectedCourseForManage, setSelectedCourseForManage] = useState<any | null>(null);
  const [courseLiveClass, setCourseLiveClass] = useState<any | null>(null);
  const [courseRecordings, setCourseRecordings] = useState<any[]>([]);
  const [courseStudentCount, setCourseStudentCount] = useState<number>(0);
  const [loadingManageDetails, setLoadingManageDetails] = useState<boolean>(false);

  // Add Course Modal State
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('Grade 7 Science');
  const [newCourseType, setNewCourseType] = useState('Theory');
  const [newCourseFee, setNewCourseFee] = useState('1500');
  const [creatingCourse, setCreatingCourse] = useState(false);

  // Schedule Live Class Form inside Course Management
  const [schedTitle, setSchedTitle] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('19:00');
  const [schedZoomUrl, setSchedZoomUrl] = useState('');
  const [savingLiveClass, setSavingLiveClass] = useState(false);

  // Add Recording Form inside Course Management
  const [recTitle, setRecTitle] = useState('');
  const [recDate, setRecDate] = useState('');
  const [recDuration, setRecDuration] = useState('2h 30m');
  const [recVideoId, setRecVideoId] = useState('');
  const [savingRecording, setSavingRecording] = useState(false);

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

  useEffect(() => {
    fetchCourses();
    generateRandomPassword();
  }, []);

  useEffect(() => {
    if (activeTab === 'students' && studentSubTab === 'list' && selectedFilterCourse) {
      fetchStudentsForCourse(selectedFilterCourse);
    }
  }, [activeTab, studentSubTab, selectedFilterCourse]);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await fetch('/api/manage-courses');
      const data = await res.json();
      if (res.ok && data.courses) {
        setCourses(data.courses);
        if (data.courses.length > 0 && !selectedFilterCourse) {
          setSelectedFilterCourse(data.courses[0].id.toString());
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchCourseDetailedInfo = async (courseId: string) => {
    setLoadingManageDetails(true);
    try {
      const res = await fetch(`/api/manage-courses?courseId=${courseId}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedCourseForManage(data.course);
        setCourseLiveClass(data.liveClass);
        setCourseRecordings(data.recordings || []);
        setCourseStudentCount(data.studentCount || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingManageDetails(false);
    }
  };

  const handleSelectCourseToManage = (course: any) => {
    setSelectedCourseForManage(course);
    fetchCourseDetailedInfo(course.id.toString());
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCourse(true);
    try {
      const res = await fetch('/api/manage-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_course',
          title: newCourseTitle,
          category: newCourseCategory,
          type: newCourseType,
          monthly_fee: newCourseFee,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('නව පන්තිය සාර්ථකව එක් කරන ලදී!');
      setShowAddCourseModal(false);
      setNewCourseTitle('');
      fetchCourses();
    } catch (err: any) {
      alert('දෝෂයකි: ' + err.message);
    } finally {
      setCreatingCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`"${title}" පන්තිය සම්පූර්ණයෙන්ම ඉවත් කිරීමට අවශ්‍යද? මෙහි ඇති Zoom links, Recordings සහ Enrollments සියල්ල මැකී යනු ඇත.`)) {
      return;
    }

    try {
      const res = await fetch('/api/manage-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_course', courseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('පන්තිය සාර්ථකව ඉවත් කරන ලදී!');
      if (selectedCourseForManage?.id === courseId) {
        setSelectedCourseForManage(null);
      }
      fetchCourses();
    } catch (err: any) {
      alert('දෝෂයකි: ' + err.message);
    }
  };

  const handleSaveLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForManage) return;
    setSavingLiveClass(true);
    try {
      const res = await fetch('/api/manage-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'schedule_live_class',
          courseId: selectedCourseForManage.id,
          title: schedTitle,
          date: schedDate,
          time: schedTime,
          zoom_join_url: schedZoomUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('සජීවී Zoom පන්තිය සාර්ථකව Schedule කරන ලදී!');
      setCourseLiveClass(data.liveClass);
      setSchedTitle('');
      setSchedZoomUrl('');
    } catch (err: any) {
      alert('දෝෂයකි: ' + err.message);
    } finally {
      setSavingLiveClass(false);
    }
  };

  const handleDeleteLiveClass = async (classId: string) => {
    if (!confirm('මෙම සජීවී පන්ති කාලසටහන ඉවත් කිරීමට අවශ්‍යද?')) return;
    try {
      const res = await fetch('/api/manage-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_live_class', classId }),
      });
      if (res.ok) {
        setCourseLiveClass(null);
        alert('කාලසටහන ඉවත් කරන ලදී.');
      }
    } catch (e: any) {
      alert('දෝෂයකි: ' + e.message);
    }
  };

  const handleAddRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForManage) return;
    setSavingRecording(true);
    try {
      const res = await fetch('/api/manage-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_recording',
          courseId: selectedCourseForManage.id,
          title: recTitle,
          lesson_date: recDate,
          duration: recDuration,
          video_id: recVideoId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('Recording එක සාර්ථකව Playlist එකට එක් කරන ලදී!');
      setCourseRecordings(prev => [data.recording, ...prev]);
      setRecTitle('');
      setRecVideoId('');
    } catch (err: any) {
      alert('දෝෂයකි: ' + err.message);
    } finally {
      setSavingRecording(false);
    }
  };

  const handleDeleteRecording = async (recId: string) => {
    if (!confirm('මෙම Recording එක Playlist එකෙන් ඉවත් කිරීමට අවශ්‍යද?')) return;
    try {
      const res = await fetch('/api/manage-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_recording', recordingId: recId }),
      });
      if (res.ok) {
        setCourseRecordings(prev => prev.filter(r => r.id !== recId));
        alert('Recording එක ඉවත් කරන ලදී.');
      }
    } catch (e: any) {
      alert('දෝෂයකි: ' + e.message);
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
            onClick={() => { setActiveTab('courses'); setSelectedCourseForManage(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'courses' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            📚 Courses / පන්ති
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
        
        {/* ============================================================== */}
        {/* TAB: COURSES / පන්ති (CLASS HUB & MANAGEMENT) */}
        {/* ============================================================== */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            
            {/* 1. VIEW SPECIFIC COURSE DETAILS & WORKSPACE */}
            {selectedCourseForManage ? (
              <div className="space-y-6">
                {/* Back bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0c1322] border border-slate-800 p-5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedCourseForManage(null)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>සියලු පන්ති වෙත</span>
                    </button>
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        {selectedCourseForManage.title}
                        <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] uppercase font-bold">
                          {selectedCourseForManage.category} • {selectedCourseForManage.type}
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        මාසික ගාස්තුව: <strong className="text-emerald-400">Rs. {selectedCourseForManage.monthly_fee}/-</strong> | සක්‍රිය සිසුන්: <strong className="text-purple-300">{courseStudentCount}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCourse(selectedCourseForManage.id, selectedCourseForManage.title)}
                    className="px-3.5 py-2 rounded-xl bg-red-600/10 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>මෙම පන්තිය Delete කරන්න</span>
                  </button>
                </div>

                {loadingManageDetails ? (
                  <div className="p-16 text-center text-slate-400">පන්තියේ දත්ත ලබාගනිමින් පවතී...</div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* SECTION A: LIVE ZOOM CLASS SCHEDULE */}
                    <div className="bg-[#0c1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <Video className="w-5 h-5 text-purple-400" />
                          <h3 className="font-bold text-base">සජීවී Zoom පන්තිය (Live Class)</h3>
                        </div>
                        {courseLiveClass && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            SCHEDULED
                          </span>
                        )}
                      </div>

                      {courseLiveClass ? (
                        <div className="p-5 rounded-xl bg-[#131c31] border border-purple-500/30 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">වත්මන් සජීවී කාලසටහන</span>
                              <h4 className="text-base font-bold text-white mt-0.5">{courseLiveClass.title}</h4>
                            </div>
                            <button
                              onClick={() => handleDeleteLiveClass(courseLiveClass.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"
                              title="Schedule එක ඉවත් කරන්න"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-slate-300">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-purple-400" /> {courseLiveClass.date}</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-purple-400" /> {courseLiveClass.time}</span>
                          </div>
                          <a
                            href={courseLiveClass.zoom_join_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline pt-1 break-all"
                          >
                            <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                            <span>{courseLiveClass.zoom_join_url}</span>
                          </a>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                          මෙම පන්තියට තවමත් සජීවී Zoom Link එකක් Schedule කර නොමැත.
                        </div>
                      )}

                      {/* Schedule Form */}
                      <form onSubmit={handleSaveLiveClass} className="space-y-4 pt-2">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          {courseLiveClass ? 'අලුත් Zoom පන්තියක් Schedule කිරීම (Update)' : 'නව Zoom පන්තියක් Schedule කරන්න'}
                        </h4>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">පාඩමේ මාතෘකාව *</label>
                          <input
                            type="text"
                            required
                            placeholder="උදා: සෛල විද්‍යාව - විශේෂ ප්‍රශ්න පත්‍ර සාකච්ඡාව"
                            value={schedTitle}
                            onChange={(e) => setSchedTitle(e.target.value)}
                            className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">දිනය</label>
                            <input
                              type="date"
                              required
                              value={schedDate}
                              onChange={(e) => setSchedDate(e.target.value)}
                              className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">වේලාව</label>
                            <input
                              type="time"
                              required
                              value={schedTime}
                              onChange={(e) => setSchedTime(e.target.value)}
                              className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Zoom Meeting Join URL *</label>
                          <input
                            type="url"
                            required
                            placeholder="https://us02web.zoom.us/j/..."
                            value={schedZoomUrl}
                            onChange={(e) => setSchedZoomUrl(e.target.value)}
                            className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={savingLiveClass}
                          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-lg shadow-purple-600/20 disabled:opacity-50"
                        >
                          {savingLiveClass ? 'Schedule වෙමින් පවතී...' : '📅 මෙම පන්තියට Zoom Link එක Publish කරන්න'}
                        </button>
                      </form>
                    </div>

                    {/* SECTION B: RECORDINGS MANAGEMENT */}
                    <div className="bg-[#0c1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <Film className="w-5 h-5 text-blue-400" />
                          <h3 className="font-bold text-base">Class Recordings ({courseRecordings.length})</h3>
                        </div>
                        <span className="text-[10px] text-slate-400">Bunny Stream DRM Protection</span>
                      </div>

                      {/* Add Recording Form */}
                      <form onSubmit={handleAddRecording} className="space-y-4 bg-[#131c31] p-4 rounded-xl border border-slate-800">
                        <h4 className="text-xs font-bold text-slate-200">➕ අලුත් Recording එකක් එකතු කරන්න</h4>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">පාඩමේ නම / මාතෘකාව *</label>
                          <input
                            type="text"
                            required
                            placeholder="උදා: පාඩම 02: සම්පූර්ණ විවරණය"
                            value={recTitle}
                            onChange={(e) => setRecTitle(e.target.value)}
                            className="w-full bg-[#0c1322] border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">පැවැත්වූ දිනය</label>
                            <input
                              type="date"
                              required
                              value={recDate}
                              onChange={(e) => setRecDate(e.target.value)}
                              className="w-full bg-[#0c1322] border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">කාලය (Duration)</label>
                            <input
                              type="text"
                              placeholder="2h 15m"
                              value={recDuration}
                              onChange={(e) => setRecDuration(e.target.value)}
                              className="w-full bg-[#0c1322] border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Bunny Video ID (හෝ Embed Video ID) *</label>
                          <input
                            type="text"
                            required
                            placeholder="උදා: d27c8192-3a81-4321-9988-xxxx"
                            value={recVideoId}
                            onChange={(e) => setRecVideoId(e.target.value)}
                            className="w-full bg-[#0c1322] border border-slate-700 rounded-xl px-4 py-2 text-xs text-blue-300 font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={savingRecording}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                        >
                          {savingRecording ? 'එක්වෙමින් පවතී...' : '+ Recording එක Playlist එකට දමන්න'}
                        </button>
                      </form>

                      {/* Recordings List */}
                      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                        {courseRecordings.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-500">මෙම පන්තියට තවම Recordings නොමැත.</div>
                        ) : (
                          courseRecordings.map((rec) => (
                            <div key={rec.id} className="p-3.5 rounded-xl bg-[#131c31] border border-slate-800 flex items-center justify-between hover:border-slate-700 transition">
                              <div className="space-y-1 pr-3">
                                <h5 className="text-xs font-semibold text-white line-clamp-1">{rec.title}</h5>
                                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                  <span>📅 {rec.lesson_date}</span>
                                  <span>⏱️ {rec.duration || '2h 30m'}</span>
                                  <span className="font-mono text-blue-400">ID: {rec.video_id?.substring(0, 10)}...</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteRecording(rec.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"
                                title="Recording එක මකන්න"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* 2. OVERVIEW OF ALL COURSES (DEFAULT VIEW) */
              <div className="space-y-6">
                
                {/* Actions & Stats Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0c1322] border border-slate-800 p-5 rounded-2xl shadow-xl">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                      පාඨමාලා හා පන්ති කළමනාකරණය
                    </h2>
                    <p className="text-xs text-slate-400">ඔබ දැනට පවත්වන සියලුම පන්ති මෙතැනින් කළමනාකරණය කරන්න.</p>
                  </div>
                  <button
                    onClick={() => setShowAddCourseModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ අලුත් පන්තියක් සාදන්න</span>
                  </button>
                </div>

                {/* Courses Grid */}
                {loadingCourses ? (
                  <div className="p-16 text-center text-slate-400 text-sm">පන්ති ලැයිස්තුව ලබාගනිමින් පවතී...</div>
                ) : courses.length === 0 ? (
                  <div className="p-16 bg-[#0c1322] border border-slate-800 rounded-2xl text-center space-y-3">
                    <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
                    <h3 className="text-base font-bold text-white">තවමත් පන්ති කිසිවක් සකස් කර නොමැත</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      ඉහත ඇති "+ අලුත් පන්තියක් සාදන්න" බොත්තම ඔබා ඔබේ පළමු පන්තිය පහසුවෙන් එක් කරන්න.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((c) => (
                      <div
                        key={c.id}
                        className="bg-[#0c1322] border border-slate-800/80 hover:border-purple-500/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5 transition group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] uppercase font-bold tracking-wider">
                              {c.category || 'Class'} • {c.type || 'Theory'}
                            </span>
                            <span className="font-mono text-xs font-bold text-emerald-400">
                              Rs. {c.monthly_fee || '0'}/-
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition line-clamp-2">
                            {c.title}
                          </h3>

                          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-purple-400" />
                              <span>{c.studentCount || 0} සිසුන්</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Film className="w-3.5 h-3.5 text-blue-400" />
                              <span>{c.recordingCount || 0} Recordings</span>
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => handleSelectCourseToManage(c)}
                            className="flex-1 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <span>⚙️ පන්තිය කළමනාකරණය</span>
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(c.id, c.title)}
                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/50 transition cursor-pointer"
                            title="පන්තිය ඉවත් කරන්න"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: STUDENTS (STUDENTS DIRECTORY & REGISTRATION) */}
        {/* ============================================================== */}
        {activeTab === 'students' && (
          <div className="space-y-6">
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

            {studentSubTab === 'register' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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

            {studentSubTab === 'list' && (
              <div className="space-y-6">
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
                                    <button
                                      disabled={actionLoadingId === `extend_${st.userId}`}
                                      onClick={() => handleExtendAccess(st)}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
                                    >
                                      {actionLoadingId === `extend_${st.userId}` ? '...' : '+30 Days ගාස්තු සක්‍රිය'}
                                    </button>

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

      </main>

      {/* ============================================================== */}
      {/* MODAL: CREATE NEW COURSE */}
      {/* ============================================================== */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1322] border border-slate-800 max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddCourseModal(false)}
              className="absolute right-5 top-5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                නව පන්තියක් සකස් කිරීම
              </h3>
              <p className="text-xs text-slate-400">නව පන්තියේ විස්තර ඇතුළත් කර පද්ධතියට එක් කරන්න.</p>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1.5">පන්තියේ නම (Course Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="උදා: Grade 8 Science - Theory Masterclass"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1.5">ප්‍රවර්ගය (Category) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Grade 7 Science / A/L"
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value)}
                    className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1.5">වර්ගය (Type) *</label>
                  <select
                    value={newCourseType}
                    onChange={(e) => setNewCourseType(e.target.value)}
                    className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Revision">Revision</option>
                    <option value="Paper">Paper Class</option>
                    <option value="Special">Special Seminar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1.5">මාසික පන්ති ගාස්තුව (Monthly Fee - Rs.) *</label>
                <input
                  type="number"
                  required
                  placeholder="1500"
                  value={newCourseFee}
                  onChange={(e) => setNewCourseFee(e.target.value)}
                  className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-emerald-400 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={creatingCourse}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-purple-600/30"
              >
                {creatingCourse ? 'එක්වෙමින් පවතී...' : '+ මෙම පන්තිය සුරකින්න (Save Course)'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}