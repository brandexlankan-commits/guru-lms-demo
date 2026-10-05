'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, Video, Users, Plus, Trash2, ArrowLeft, 
  Calendar, Clock, Film, PlayCircle,
  CheckCircle, AlertCircle, X, RefreshCw,
  Search, Unlock, Lock, PhoneCall, CreditCard, Eye, EyeOff, Copy, Check, ExternalLink, Sparkles,
  FileText, UploadCloud, File, Award, Download, KeyRound, CheckCircle2, MessageSquare, ShieldAlert
} from 'lucide-react';

const Youtube = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function AdminDashboard() {
  const router = useRouter();

  // Security & Auth Guard State
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);

  const [activeTab, setActiveTab] = useState<'courses' | 'students' | 'devices' | 'slips' | 'zoom'>('courses');
  const [studentSubTab, setStudentSubTab] = useState<'register' | 'list'>('list');

  // Courses state
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedFilterCourse, setSelectedFilterCourse] = useState<string>('');

  // Course Hub Management States
  const [selectedCourseForManage, setSelectedCourseForManage] = useState<any | null>(null);
  const [courseSectionTab, setCourseSectionTab] = useState<'live_recordings' | 'materials' | 'assignments'>('live_recordings');
  const [courseLiveClass, setCourseLiveClass] = useState<any | null>(null);
  const [courseRecordings, setCourseRecordings] = useState<any[]>([]);
  const [courseMaterials, setCourseMaterials] = useState<any[]>([]);
  const [courseAssignments, setCourseAssignments] = useState<any[]>([]);
  const [courseStudentCount, setCourseStudentCount] = useState<number>(0);
  const [loadingManageDetails, setLoadingManageDetails] = useState<boolean>(false);

  // Assignment Submissions & Grading Modal State
  const [gradingModalAssignment, setGradingModalAssignment] = useState<any | null>(null);
  const [assignmentSubmissionsList, setAssignmentSubmissionsList] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState<boolean>(false);
  const [savingMarksId, setSavingMarksId] = useState<string | null>(null);
  const [marksInputMap, setMarksInputMap] = useState<{ [subId: string]: string }>({});
  const [feedbackInputMap, setFeedbackInputMap] = useState<{ [subId: string]: string }>({});
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  // Add Course Modal State
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('Grade 8 ICT');
  const [newCourseType, setNewCourseType] = useState('Theory');
  const [newCourseFee, setNewCourseFee] = useState('1500');
  const [creatingCourse, setCreatingCourse] = useState(false);

  // Live Class form states
  const [schedTitle, setSchedTitle] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('19:00');
  const [savingLiveClass, setSavingLiveClass] = useState(false);

  // YouTube Recordings form states
  const [recTitle, setRecTitle] = useState('');
  const [recDate, setRecDate] = useState('');
  const [recDuration, setRecDuration] = useState('2h 00m');
  const [recYoutubeUrl, setRecYoutubeUrl] = useState('');
  const [savingRecording, setSavingRecording] = useState(false);

  // Tutes / Study Materials Form State
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matFile, setMatFile] = useState<File | null>(null);
  const [savingMaterial, setSavingMaterial] = useState(false);

  // Assignments Form State
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignDueTime, setAssignDueTime] = useState('23:59');
  const [assignMarks, setAssignMarks] = useState('100');
  const [assignFile, setAssignFile] = useState<File | null>(null);
  const [savingAssignment, setSavingAssignment] = useState(false);

  // Add Student Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [createdStudentData, setCreatedStudentData] = useState<any>(null);

  // Class-wise Students List State
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [currentMonthName, setCurrentMonthName] = useState('Current');
  const [nextMonthName, setNextMonthName] = useState('Next');
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<{ [userId: string]: boolean }>({});

  // Devices Hub State
  const [deviceStats, setDeviceStats] = useState({ totalStudents: 0, lockedCount: 0, unlockedCount: 0 });
  const [devicesList, setDevicesList] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [searchDeviceQuery, setSearchDeviceQuery] = useState('');

  // Slip Approvals State
  const [slipStats, setSlipStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [slipsList, setSlipsList] = useState<any[]>([]);
  const [loadingSlips, setLoadingSlips] = useState(false);
  const [slipFilter, setSlipFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchSlipQuery, setSearchSlipQuery] = useState('');
  const [previewSlip, setPreviewSlip] = useState<any | null>(null);
  const [processingSlipId, setProcessingSlipId] = useState<string | null>(null);

  // Zoom Settings State
  const [zoomAccountId, setZoomAccountId] = useState('');
  const [zoomClientId, setZoomClientId] = useState('');
  const [zoomClientSecret, setZoomClientSecret] = useState('');
  const [savingZoom, setSavingZoom] = useState(false);
  const [testingZoom, setTestingZoom] = useState(false);
  const [zoomStatusMessage, setZoomStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 🛡️ STRICT AUTH & ROLE SECURITY GUARD
  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // If not logged in, bounce immediately to login
          router.replace('/login');
          return;
        }

        const userEmail = (user.email || '').toLowerCase();
        const userRole = (user.user_metadata?.role || '').toLowerCase();
        const userUsername = (user.user_metadata?.username || '').toLowerCase();

        const isAdmin = 
          userRole === 'admin' || 
          userRole === 'teacher' || 
          userUsername === 'admin' ||
          userUsername === 'teacher' ||
          userEmail === 'admin@learnict.lk' ||
          userEmail === 'mano.ict@gmail.com' ||
          (userEmail.includes('admin') && !userEmail.includes('@student.')) ||
          (userEmail.includes('teacher') && !userEmail.includes('@student.'));

        if (!isAdmin) {
          // A student or unauthorized user attempted to access /admin/dashboard directly!
          alert('Access Denied: You do not have administrative privileges.');
          router.replace('/student/dashboard');
          return;
        }

        setIsAuthorizedAdmin(true);
        fetchCourses();
        generateRandomPassword();
      } catch (err) {
        console.error(err);
        router.replace('/login');
      } finally {
        setAuthChecking(false);
      }
    };

    verifyAdminAccess();
  }, [router]);

  useEffect(() => {
    if (isAuthorizedAdmin) {
      if (activeTab === 'students' && studentSubTab === 'list' && selectedFilterCourse) {
        fetchStudentsForCourse(selectedFilterCourse);
      }
      if (activeTab === 'devices') {
        fetchDevicesData();
      }
      if (activeTab === 'slips') {
        fetchSlipsData();
      }
      if (activeTab === 'zoom') {
        fetchZoomSettings();
      }
    }
  }, [activeTab, studentSubTab, selectedFilterCourse, isAuthorizedAdmin]);

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

  const fetchDevicesData = async () => {
    setLoadingDevices(true);
    try {
      const res = await fetch('/api/admin/devices');
      const data = await res.json();
      if (res.ok) {
        setDeviceStats(data.stats);
        setDevicesList(data.students || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDevices(false);
    }
  };

  const fetchSlipsData = async () => {
    setLoadingSlips(true);
    try {
      const res = await fetch('/api/admin/slips');
      const data = await res.json();
      if (res.ok) {
        setSlipStats(data.stats);
        setSlipsList(data.slips || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSlips(false);
    }
  };

  const fetchZoomSettings = async () => {
    try {
      const res = await fetch('/api/admin/zoom-settings');
      const data = await res.json();
      if (res.ok) {
        setZoomAccountId(data.accountId || '');
        setZoomClientId(data.clientId || '');
        setZoomClientSecret(data.clientSecret || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveZoomSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingZoom(true);
    setZoomStatusMessage(null);
    try {
      const res = await fetch('/api/admin/zoom-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_credentials',
          accountId: zoomAccountId,
          clientId: zoomClientId,
          clientSecret: zoomClientSecret,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setZoomStatusMessage({ type: 'success', text: '✅ Zoom credentials saved successfully!' });
    } catch (err: any) {
      setZoomStatusMessage({ type: 'error', text: '❌ Failed to save: ' + err.message });
    } finally {
      setSavingZoom(false);
    }
  };

  const handleTestZoomConnection = async () => {
    setTestingZoom(true);
    setZoomStatusMessage(null);
    try {
      const res = await fetch('/api/admin/zoom-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_connection',
          accountId: zoomAccountId,
          clientId: zoomClientId,
          clientSecret: zoomClientSecret,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Connection Failed');
      }

      setZoomStatusMessage({ type: 'success', text: '🎉 Excellent! Connected to Zoom Account successfully. API Ready!' });
    } catch (err: any) {
      setZoomStatusMessage({ type: 'error', text: '⚠️ ' + err.message });
    } finally {
      setTestingZoom(false);
    }
  };

  const handleApproveSlip = async (slip: any) => {
    setProcessingSlipId(slip.id);
    try {
      const res = await fetch('/api/admin/slips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          slipId: slip.id,
          studentId: slip.student_id,
          courseId: slip.course_id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message || 'Bank slip approved successfully!');
      if (previewSlip?.id === slip.id) setPreviewSlip(null);
      fetchSlipsData();
      if (selectedFilterCourse) fetchStudentsForCourse(selectedFilterCourse);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setProcessingSlipId(null);
    }
  };

  const handleRejectSlip = async (slip: any) => {
    if (!confirm(`Are you sure you want to reject the slip submitted by ${slip.studentName}?`)) return;

    setProcessingSlipId(slip.id);
    try {
      const res = await fetch('/api/admin/slips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          slipId: slip.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('Bank slip rejected.');
      if (previewSlip?.id === slip.id) setPreviewSlip(null);
      fetchSlipsData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setProcessingSlipId(null);
    }
  };

  const handleDeleteSlip = async (slip: any) => {
    if (!confirm(`Are you sure you want to permanently delete the slip submitted by ${slip.studentName}?`)) return;

    setProcessingSlipId(slip.id);
    try {
      const res = await fetch('/api/admin/slips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          slipId: slip.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message || 'Bank slip deleted successfully.');
      if (previewSlip?.id === slip.id) setPreviewSlip(null);
      fetchSlipsData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setProcessingSlipId(null);
    }
  };

  const handleResetSingleDevice = async (student: any) => {
    if (!confirm(`Reset registered device for ${student.fullName} (@${student.username})?`)) return;

    setActionLoadingId(student.id);
    try {
      const res = await fetch('/api/admin/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_device', userId: student.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setDevicesList(prev =>
        prev.map(s => (s.id === student.id ? { ...s, deviceId: null, isLocked: false } : s))
      );
      setDeviceStats(prev => ({
        ...prev,
        lockedCount: Math.max(0, prev.lockedCount - 1),
        unlockedCount: prev.unlockedCount + 1,
      }));
      alert('Device unlocked successfully!');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBulkResetAll = async () => {
    if (!confirm('Warning! Are you sure you want to unlock devices for ALL students simultaneously?')) return;

    setLoadingDevices(true);
    try {
      const res = await fetch('/api/admin/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_all' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('All devices unlocked successfully!');
      fetchDevicesData();
    } catch (err: any) {
      alert('Error: ' + err.message);
      setLoadingDevices(false);
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
        setCourseMaterials(data.materials || []);
        setCourseAssignments(data.assignments || []);
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
    setCourseSectionTab('live_recordings');
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

      alert('New course created successfully!');
      setShowAddCourseModal(false);
      setNewCourseTitle('');
      fetchCourses();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setCreatingCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the course "${title}" completely?`)) return;
    try {
      const res = await fetch('/api/manage-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_course', courseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('Course deleted.');
      if (selectedCourseForManage?.id === courseId) {
        setSelectedCourseForManage(null);
      }
      fetchCourses();
    } catch (err: any) {
      alert('Error: ' + err.message);
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
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message || 'Live Zoom Class scheduled successfully!');
      setCourseLiveClass(data.liveClass);
      setSchedTitle('');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSavingLiveClass(false);
    }
  };

  const handleDeleteLiveClass = async (classId: string) => {
    if (!confirm('Remove this scheduled live class?')) return;
    try {
      const res = await fetch('/api/manage-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_live_class', classId }),
      });
      if (res.ok) {
        setCourseLiveClass(null);
        alert('Live class schedule removed.');
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : url.trim();
  };

  const handleAddRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForManage) return;

    const parsedVideoId = extractYouTubeId(recYoutubeUrl);
    if (!parsedVideoId || parsedVideoId.length !== 11) {
      alert('Please enter a valid YouTube video link.');
      return;
    }

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
          video_id: parsedVideoId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('Class recording added successfully!');
      setCourseRecordings(prev => [data.recording, ...prev]);
      setRecTitle('');
      setRecYoutubeUrl('');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSavingRecording(false);
    }
  };

  const handleDeleteRecording = async (recId: string) => {
    if (!confirm('Delete this recording?')) return;
    try {
      const res = await fetch('/api/manage-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_recording', recordingId: recId }),
      });
      if (res.ok) {
        setCourseRecordings(prev => prev.filter(r => r.id !== recId));
        alert('Recording deleted.');
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const uploadToStorage = async (file: File, folder: string) => {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${folder}/${Date.now()}_${cleanFileName}`;

    const { error: uploadErr } = await supabase.storage
      .from('lms-materials')
      .upload(storagePath, file, { cacheControl: '3600', upsert: true });

    if (uploadErr) throw uploadErr;

    const { data: { publicUrl } } = supabase.storage
      .from('lms-materials')
      .getPublicUrl(storagePath);

    return {
      publicUrl,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    };
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForManage || !matFile) {
      alert('Please select a PDF or document file.');
      return;
    }

    setSavingMaterial(true);
    try {
      const { publicUrl, fileName, fileSize } = await uploadToStorage(matFile, 'tutes');

      const res = await fetch('/api/manage-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_material',
          courseId: selectedCourseForManage.id,
          title: matTitle,
          description: matDesc,
          file_url: publicUrl,
          file_name: fileName,
          file_size: fileSize,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('Study material uploaded successfully!');
      setCourseMaterials(prev => [data.material, ...prev]);
      setMatTitle('');
      setMatDesc('');
      setMatFile(null);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSavingMaterial(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Delete this study material?')) return;
    try {
      const res = await fetch('/api/manage-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_material', materialId }),
      });
      if (res.ok) {
        setCourseMaterials(prev => prev.filter(m => m.id !== materialId));
        alert('Material deleted.');
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForManage) return;

    if (!assignDueDate) {
      alert('Please select a deadline date.');
      return;
    }

    setSavingAssignment(true);
    try {
      let fileUrl = null;
      if (assignFile) {
        const uploaded = await uploadToStorage(assignFile, 'assignments');
        fileUrl = uploaded.publicUrl;
      }

      const dueDateTime = `${assignDueDate}T${assignDueTime || '23:59'}:00Z`;

      const res = await fetch('/api/manage-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_assignment',
          courseId: selectedCourseForManage.id,
          title: assignTitle,
          description: assignDesc,
          due_date: dueDateTime,
          total_marks: assignMarks,
          file_url: fileUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('Assignment published successfully!');
      setCourseAssignments(prev => [data.assignment, ...prev]);
      setAssignTitle('');
      setAssignDesc('');
      setAssignDueDate('');
      setAssignMarks('100');
      setAssignFile(null);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      const res = await fetch('/api/manage-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_assignment', assignmentId }),
      });
      if (res.ok) {
        setCourseAssignments(prev => prev.filter(a => a.id !== assignmentId));
        alert('Assignment deleted.');
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const handleOpenGradingModal = async (assignment: any) => {
    setGradingModalAssignment(assignment);
    setLoadingSubmissions(true);
    setEditingSubId(null);
    try {
      const res = await fetch(`/api/admin/assignment-submissions?assignmentId=${assignment.id}`);
      const data = await res.json();
      if (res.ok) {
        setAssignmentSubmissionsList(data.submissions || []);
        const initialMarks: { [key: string]: string } = {};
        const initialFeedback: { [key: string]: string } = {};
        (data.submissions || []).forEach((s: any) => {
          initialMarks[s.id] = s.marks !== null && s.marks !== undefined ? s.marks.toString() : '';
          initialFeedback[s.id] = s.feedback || '';
        });
        setMarksInputMap(initialMarks);
        setFeedbackInputMap(initialFeedback);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleSaveMarks = async (sub: any) => {
    const enteredMarks = marksInputMap[sub.id];
    const enteredFeedback = feedbackInputMap[sub.id];

    if (enteredMarks === '' || enteredMarks === undefined) {
      alert('Please enter a valid marks value.');
      return;
    }

    setSavingMarksId(sub.id);
    try {
      const res = await fetch('/api/admin/assignment-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grade_submission',
          submissionId: sub.id,
          marks: enteredMarks,
          feedback: enteredFeedback,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(`Marks saved and locked successfully for @${sub.studentUsername}!`);
      setAssignmentSubmissionsList(prev =>
        prev.map(s => (s.id === sub.id ? { ...s, marks: Number(enteredMarks), feedback: enteredFeedback, status: 'graded' } : s))
      );
      setEditingSubId(null);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSavingMarksId(null);
    }
  };

  const fetchStudentsForCourse = async (courseId: string) => {
    setLoadingStudents(true);
    try {
      const res = await fetch(`/api/manage-student?courseId=${courseId}`);
      const data = await res.json();
      if (res.ok) {
        setStudentsList(data.students || []);
        if (data.currentMonthName) setCurrentMonthName(data.currentMonthName);
        if (data.nextMonthName) setNextMonthName(data.nextMonthName);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStudents(false);
    }
  };

  const generateRandomPassword = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setPassword(`Mano#${randomDigits}`);
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
      setFormError('Please select at least one course for the student.');
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

  const handleActivateMonth = async (student: any, targetMonth: 'current_month' | 'next_month') => {
    const monthLabel = targetMonth === 'next_month' ? (student.nextMonthName || 'Next Month') : (student.currentMonthName || 'Current Month');
    if (!confirm(`Activate class access for ${student.fullName} for ${monthLabel}?`)) return;

    setActionLoadingId(`month_${targetMonth}_${student.userId}`);
    try {
      const res = await fetch('/api/manage-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'activate_month',
          userId: student.userId,
          enrollmentId: student.enrollmentId,
          targetMonth,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(`Access activated successfully for ${student.fullName} for ${monthLabel}!`);
      if (selectedFilterCourse) fetchStudentsForCourse(selectedFilterCourse);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleStatus = async (student: any) => {
    const newStatus = student.status === 'active' ? 'inactive' : 'active';
    const actionLabel = newStatus === 'active' ? 'Re-activate access' : 'Suspend access';

    if (!confirm(`${actionLabel} for ${student.fullName}?`)) return;

    setActionLoadingId(`status_${student.userId}`);
    try {
      const res = await fetch('/api/manage-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_status',
          enrollmentId: student.enrollmentId,
          newStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStudentsList(prev =>
        prev.map(s => (s.userId === student.userId ? { 
          ...s, 
          status: newStatus,
          isPaidForCurrentMonth: newStatus === 'active' ? s.isPaidForCurrentMonth : false,
          monthStatusText: newStatus === 'active' ? `Active for ${s.currentMonthName || 'Current Month'}` : 'Access Suspended'
        } : s))
      );
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResetDevice = async (student: any) => {
    if (!confirm(`Reset registered device for ${student.fullName}?`)) return;
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
      alert('Device reset successfully!');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswordMap(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const getWhatsAppUrl = (student: any) => {
    const cleanPhone = (student.phone || '').replace(/[^0-9]/g, '').replace(/^0/, '');
    
    if (!student.isPaidForCurrentMonth) {
      const currentCourse = courses.find(c => c.id.toString() === selectedFilterCourse);
      const courseTitle = currentCourse ? currentCourse.title : 'ICT Class';

      const message = `Hello ${student.fullName},
Your tuition payment for "${courseTitle}" for ${currentMonthName} has not been received yet.

To continue accessing video recordings, handouts, and live classes without interruption, please make the payment and upload your bank deposit slip via the Student Portal (https://guru-lms-demo.vercel.app/login).

Thank you!
Learn ICT with Mano`;

      return `https://wa.me/94${cleanPhone}?text=${encodeURIComponent(message)}`;
    }

    return `https://wa.me/94${cleanPhone}`;
  };

  const generateWhatsAppMessage = () => {
    if (!createdStudentData) return '';
    return `Hello ${createdStudentData.fullName},
You have been successfully enrolled in "Learn ICT with Mano" LMS.

Courses: ${createdStudentData.selectedCoursesNames}
Portal URL: https://guru-lms-demo.vercel.app/login
Username: ${createdStudentData.username}
Password: ${createdStudentData.password}

Security Notice:
Your account will automatically bind to the first device you log in with. Please use your personal device.`;
  };

  const filteredStudents = studentsList.filter(s => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (paymentFilter === 'paid') return s.isPaidForCurrentMonth;
    if (paymentFilter === 'unpaid') return !s.isPaidForCurrentMonth;
    return true;
  });

  const totalCount = studentsList.length;
  const paidCount = studentsList.filter(s => s.isPaidForCurrentMonth).length;
  const unpaidCount = studentsList.filter(s => !s.isPaidForCurrentMonth).length;

  const filteredDevices = devicesList.filter(d =>
    d.fullName.toLowerCase().includes(searchDeviceQuery.toLowerCase()) ||
    d.username.toLowerCase().includes(searchDeviceQuery.toLowerCase()) ||
    d.phone.includes(searchDeviceQuery)
  );

  const filteredSlips = slipsList.filter(slip => {
    const matchesFilter = slipFilter === 'all' || slip.status === slipFilter;
    const matchesSearch =
      slip.studentName.toLowerCase().includes(searchSlipQuery.toLowerCase()) ||
      slip.studentUsername.toLowerCase().includes(searchSlipQuery.toLowerCase()) ||
      slip.course_name?.toLowerCase().includes(searchSlipQuery.toLowerCase()) ||
      slip.studentPhone?.includes(searchSlipQuery);
    return matchesFilter && matchesSearch;
  });

  // 🛡️ Loading Screen while checking security permissions
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-white space-y-4 font-sans">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono tracking-wider">Verifying Admin Access Privileges...</p>
      </div>
    );
  }

  if (!isAuthorizedAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white p-6 md:p-10 font-sans">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-white border-2 border-purple-500/50 flex items-center justify-center shadow-xl shadow-purple-500/25 overflow-hidden shrink-0">
            <img 
              src="/logo.png" 
              alt="Learn ICT with Mano" 
              className="w-full h-full object-contain scale-[2.4] transform" 
            />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              Learn ICT with Mano
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                Admin
              </span>
            </h1>
            <p className="text-xs text-slate-400">Teacher Control Center & LMS Portal</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex flex-wrap items-center gap-2 bg-[#0d1424] p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => { setActiveTab('courses'); setSelectedCourseForManage(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              activeTab === 'courses' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            📚 Courses
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              activeTab === 'students' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            👨‍🎓 Students
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              activeTab === 'devices' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            📱 Devices
          </button>
          <button
            onClick={() => setActiveTab('slips')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer relative ${
              activeTab === 'slips' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            🧾 Bank Slips
            {slipStats.pending > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                {slipStats.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('zoom')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'zoom' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4 text-blue-400" />
            <span>🎥 Zoom Settings</span>
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="mt-8 max-w-7xl mx-auto">
        
        {/* TAB: ZOOM SETTINGS */}
        {activeTab === 'zoom' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Zoom Account Management
                  </h2>
                  <p className="text-xs text-slate-400">
                    Configure your Zoom Server-to-Server OAuth credentials for automatic meeting scheduling.
                  </p>
                </div>
              </div>

              {zoomStatusMessage && (
                <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 border ${
                  zoomStatusMessage.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}>
                  {zoomStatusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{zoomStatusMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveZoomSettings} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Zoom Account ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. xYzAbC123..."
                    value={zoomAccountId}
                    onChange={(e) => setZoomAccountId(e.target.value)}
                    className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Zoom Client ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. aBcDeF456..."
                    value={zoomClientId}
                    onChange={(e) => setZoomClientId(e.target.value)}
                    className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Zoom Client Secret *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••••••••••••••••••••"
                    value={zoomClientSecret}
                    onChange={(e) => setZoomClientSecret(e.target.value)}
                    className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={testingZoom || !zoomAccountId || !zoomClientId || !zoomClientSecret}
                    onClick={handleTestZoomConnection}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingZoom ? 'animate-spin' : ''}`} />
                    <span>{testingZoom ? 'Testing Connection...' : '🔍 Test Connection'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={savingZoom}
                    className="w-full sm:flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{savingZoom ? 'Saving...' : '💾 Save Credentials'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 1: COURSES */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {selectedCourseForManage ? (
              <div className="space-y-6">
                
                {/* Course Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0c1322] border border-slate-800 p-5 rounded-2xl shadow-xl">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedCourseForManage(null)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to All Courses</span>
                    </button>
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        {selectedCourseForManage.title}
                        <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] uppercase font-bold">
                          {selectedCourseForManage.category} • {selectedCourseForManage.type}
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        Monthly Fee: <strong className="text-emerald-400">Rs. {selectedCourseForManage.monthly_fee}/-</strong> | Enrolled Students: <strong className="text-purple-300">{courseStudentCount}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCourse(selectedCourseForManage.id, selectedCourseForManage.title)}
                    className="px-3.5 py-2 rounded-xl bg-red-600/10 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Course</span>
                  </button>
                </div>

                {/* Sub-Tabs Navigation */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <button
                    onClick={() => setCourseSectionTab('live_recordings')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      courseSectionTab === 'live_recordings'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                        : 'bg-[#131c31] text-slate-400 hover:text-white'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>🎥 Live & Recordings ({courseRecordings.length})</span>
                  </button>

                  <button
                    onClick={() => setCourseSectionTab('materials')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      courseSectionTab === 'materials'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                        : 'bg-[#131c31] text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>📑 Handouts & Tutes ({courseMaterials.length})</span>
                  </button>

                  <button
                    onClick={() => setCourseSectionTab('assignments')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      courseSectionTab === 'assignments'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                        : 'bg-[#131c31] text-slate-400 hover:text-white'
                    }`}
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>📝 Assignments & Tasks ({courseAssignments.length})</span>
                  </button>
                </div>

                {loadingManageDetails ? (
                  <div className="p-16 text-center text-slate-400">Loading course details...</div>
                ) : (
                  <>
                    {/* SECTION 1: LIVE & RECORDINGS */}
                    {courseSectionTab === 'live_recordings' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Live Class Schedule Form */}
                        <div className="bg-[#0c1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                              <Video className="w-5 h-5 text-purple-400" />
                              <h3 className="font-bold text-base">Live Zoom Class Schedule</h3>
                            </div>
                            {courseLiveClass && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                SCHEDULED
                              </span>
                            )}
                          </div>

                          {courseLiveClass ? (
                            <div className="p-5 rounded-xl bg-[#131c31] border border-purple-500/30 space-y-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Current Schedule</span>
                                  <h4 className="text-base font-bold text-white mt-0.5">{courseLiveClass.title}</h4>
                                </div>
                                <button
                                  onClick={() => handleDeleteLiveClass(courseLiveClass.id)}
                                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
                                  title="Remove Schedule"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-4 text-xs text-slate-300">
                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-purple-400" /> {courseLiveClass.date}</span>
                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-purple-400" /> {courseLiveClass.time}</span>
                              </div>

                              <div className="pt-2">
                                <a
                                  href={`/api/zoom/start?meetingId=${courseLiveClass.meeting_id || courseLiveClass.zoom_join_url?.split('meetingId=')[1]?.split('&')[0]}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <Video className="w-4 h-4" />
                                  <span>🚀 Start Class (Join as Host)</span>
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                              No live Zoom class currently scheduled for this course.
                            </div>
                          )}

                          <form onSubmit={handleSaveLiveClass} className="space-y-4 pt-2">
                            <div>
                              <label className="block text-xs text-slate-400 mb-1">Lesson Topic *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Operating Systems & Practical Discussion"
                                value={schedTitle}
                                onChange={(e) => setSchedTitle(e.target.value)}
                                className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Date</label>
                                <input
                                  type="date"
                                  required
                                  value={schedDate}
                                  onChange={(e) => setSchedDate(e.target.value)}
                                  className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Time</label>
                                <input
                                  type="time"
                                  required
                                  value={schedTime}
                                  onChange={(e) => setSchedTime(e.target.value)}
                                  className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={savingLiveClass}
                              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-purple-600/30 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                              {savingLiveClass ? 'Creating Zoom Meeting...' : '⚡ Schedule & Publish Live Class'}
                            </button>
                          </form>
                        </div>

                        {/* YouTube Recordings Section */}
                        <div className="bg-[#0c1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                              <Film className="w-5 h-5 text-red-500" />
                              <h3 className="font-bold text-base">Class Recordings ({courseRecordings.length})</h3>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold flex items-center gap-1">
                              <Youtube className="w-3 h-3" /> YouTube Package Data
                            </span>
                          </div>

                          <form onSubmit={handleAddRecording} className="space-y-3 bg-[#131c31] p-4 rounded-xl border border-slate-800">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">Recording Title *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Lesson 03: Python Functions & Lists"
                                value={recTitle}
                                onChange={(e) => setRecTitle(e.target.value)}
                                className="w-full bg-[#0c1322] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] text-slate-400 mb-1">Lesson Date</label>
                                <input
                                  type="date"
                                  required
                                  value={recDate}
                                  onChange={(e) => setRecDate(e.target.value)}
                                  className="w-full bg-[#0c1322] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-slate-400 mb-1">Duration</label>
                                <input
                                  type="text"
                                  placeholder="2h 00m"
                                  value={recDuration}
                                  onChange={(e) => setRecDuration(e.target.value)}
                                  className="w-full bg-[#0c1322] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">YouTube Video Link (Unlisted) *</label>
                              <input
                                type="text"
                                required
                                placeholder="https://youtu.be/xxxxxx or https://www.youtube.com/watch?v=xxxxxx"
                                value={recYoutubeUrl}
                                onChange={(e) => setRecYoutubeUrl(e.target.value)}
                                className="w-full bg-[#0c1322] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-red-300 font-mono focus:outline-none focus:border-red-500"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={savingRecording}
                              className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-lg shadow-red-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Youtube className="w-3.5 h-3.5" />
                              <span>{savingRecording ? 'Adding...' : '+ Add Recording'}</span>
                            </button>
                          </form>

                          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                            {courseRecordings.length === 0 ? (
                              <div className="p-8 rounded-xl bg-slate-900/30 border border-dashed border-slate-800 text-center space-y-1">
                                <Film className="w-7 h-7 text-slate-600 mx-auto" />
                                <div className="text-xs font-semibold text-slate-400">No recordings added yet.</div>
                              </div>
                            ) : (
                              courseRecordings.map((rec) => (
                                <div key={rec.id} className="p-3.5 rounded-xl bg-[#131c31] border border-slate-800 hover:border-slate-700 transition flex items-center justify-between group">
                                  <div className="space-y-1 pr-3">
                                    <div className="flex items-center gap-2">
                                      <PlayCircle className="w-4 h-4 text-red-400 shrink-0" />
                                      <h5 className="text-xs font-semibold text-white line-clamp-1 group-hover:text-red-300 transition">{rec.title}</h5>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-slate-400 pl-6">
                                      <span>📅 {rec.lesson_date}</span>
                                      <span>⏱️ {rec.duration || '2h 00m'}</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteRecording(rec.id)}
                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer shrink-0"
                                    title="Delete Recording"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* SECTION 2: TUTES & STUDY MATERIALS */}
                    {courseSectionTab === 'materials' && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-5 bg-[#0c1322] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                            <UploadCloud className="w-5 h-5 text-emerald-400" />
                            <h3 className="font-bold text-base">Upload Study Material / Handout</h3>
                          </div>

                          <form onSubmit={handleAddMaterial} className="space-y-4">
                            <div>
                              <label className="block text-xs text-slate-400 mb-1">Handout Title *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Grade 8 ICT - Unit 01 Notes"
                                value={matTitle}
                                onChange={(e) => setMatTitle(e.target.value)}
                                className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-slate-400 mb-1">Short Description</label>
                              <textarea
                                rows={2}
                                placeholder="Brief summary of this handout..."
                                value={matDesc}
                                onChange={(e) => setMatDesc(e.target.value)}
                                className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-slate-400 mb-1">PDF or Document File *</label>
                              <input
                                type="file"
                                required
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setMatFile(e.target.files?.[0] || null)}
                                className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600/20 file:text-emerald-400 hover:file:bg-emerald-600/30 cursor-pointer bg-[#131c31] border border-slate-700 rounded-xl p-2"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={savingMaterial}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                            >
                              <UploadCloud className="w-4 h-4" />
                              <span>{savingMaterial ? 'Uploading File...' : '+ Upload Handout'}</span>
                            </button>
                          </form>
                        </div>

                        <div className="lg:col-span-7 bg-[#0c1322] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <h3 className="font-bold text-base flex items-center gap-2">
                              <FileText className="w-4 h-4 text-emerald-400" />
                              <span>Available Handouts ({courseMaterials.length})</span>
                            </h3>
                            <span className="text-[11px] text-slate-400">PDF Study Materials</span>
                          </div>

                          {courseMaterials.length === 0 ? (
                            <div className="p-12 rounded-xl bg-slate-900/30 border border-dashed border-slate-800 text-center space-y-2">
                              <File className="w-8 h-8 text-slate-600 mx-auto" />
                              <div className="text-xs font-semibold text-slate-400">No handouts uploaded for this course yet.</div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {courseMaterials.map((mat) => (
                                <div key={mat.id} className="p-4 rounded-xl bg-[#131c31] border border-slate-800 hover:border-slate-700 transition flex items-center justify-between group">
                                  <div className="space-y-1 pr-4">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                                      <h5 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">{mat.title}</h5>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-slate-500 pl-6">
                                      <span>📄 {mat.file_name}</span>
                                      <span>📦 {mat.file_size}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <a
                                      href={mat.file_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-2 rounded-lg bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white transition"
                                      title="Open / Download"
                                    >
                                      <Download className="w-4 h-4" />
                                    </a>
                                    <button
                                      onClick={() => handleDeleteMaterial(mat.id)}
                                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    )}

                    {/* SECTION 3: ASSIGNMENTS & DEADLINES */}
                    {courseSectionTab === 'assignments' && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-5 bg-[#0c1322] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                            <Award className="w-5 h-5 text-amber-400" />
                            <h3 className="font-bold text-base">Create New Assignment</h3>
                          </div>

                          <form onSubmit={handleAddAssignment} className="space-y-4">
                            <div>
                              <label className="block text-xs text-slate-400 mb-1">Assignment Title *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Python Variables & Loops - Assignment"
                                value={assignTitle}
                                onChange={(e) => setAssignTitle(e.target.value)}
                                className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-amber-400 mb-1 font-semibold">Deadline Date *</label>
                                <input
                                  type="date"
                                  required
                                  value={assignDueDate}
                                  onChange={(e) => setAssignDueDate(e.target.value)}
                                  className="w-full bg-[#131c31] border border-amber-500/40 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-amber-400 mb-1 font-semibold">Deadline Time *</label>
                                <input
                                  type="time"
                                  required
                                  value={assignDueTime}
                                  onChange={(e) => setAssignDueTime(e.target.value)}
                                  className="w-full bg-[#131c31] border border-amber-500/40 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Total Marks</label>
                                <input
                                  type="number"
                                  value={assignMarks}
                                  onChange={(e) => setAssignMarks(e.target.value)}
                                  className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Paper PDF (Optional)</label>
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={(e) => setAssignFile(e.target.files?.[0] || null)}
                                  className="w-full text-[11px] text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-amber-600/20 file:text-amber-400 cursor-pointer bg-[#131c31] border border-slate-700 rounded-xl p-1.5"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={savingAssignment}
                              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-amber-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                            >
                              <Award className="w-4 h-4" />
                              <span>{savingAssignment ? 'Publishing...' : '+ Publish Assignment'}</span>
                            </button>
                          </form>
                        </div>

                        <div className="lg:col-span-7 bg-[#0c1322] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <h3 className="font-bold text-base flex items-center gap-2">
                              <Award className="w-4 h-4 text-amber-400" />
                              <span>Active Assignments ({courseAssignments.length})</span>
                            </h3>
                            <span className="text-[11px] text-slate-400">Deadlines & Tasks</span>
                          </div>

                          {courseAssignments.length === 0 ? (
                            <div className="p-12 rounded-xl bg-slate-900/30 border border-dashed border-slate-800 text-center space-y-2">
                              <Award className="w-8 h-8 text-slate-600 mx-auto" />
                              <div className="text-xs font-semibold text-slate-400">No assignments created for this course yet.</div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {courseAssignments.map((a) => {
                                const isExpired = new Date(a.due_date) < new Date();
                                const formattedDeadline = new Date(a.due_date).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                });

                                return (
                                  <div key={a.id} className="p-4 rounded-xl bg-[#131c31] border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                                    <div className="space-y-1.5 pr-2">
                                      <div className="flex items-center gap-2">
                                        <h5 className="text-xs font-bold text-white group-hover:text-amber-300 transition">{a.title}</h5>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                          isExpired ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                                        }`}>
                                          {isExpired ? 'Closed' : 'Active'}
                                        </span>
                                      </div>

                                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 pt-1">
                                        <span className="flex items-center gap-1 font-semibold text-amber-300">
                                          <Clock className="w-3 h-3 text-amber-400" /> Deadline: {formattedDeadline}
                                        </span>
                                        <span>🎯 Max Marks: {a.total_marks}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <button
                                        onClick={() => handleOpenGradingModal(a)}
                                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                                        title="Review submissions and assign marks"
                                      >
                                        <Award className="w-3.5 h-3.5" />
                                        <span>📥 Submissions & Marks</span>
                                      </button>

                                      <button
                                        onClick={() => handleDeleteAssignment(a.id)}
                                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer shrink-0"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                      </div>
                    )}
                  </>
                )}

              </div>
            ) : (
              /* Overview of All Courses */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0c1322] border border-slate-800 p-5 rounded-2xl shadow-xl">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                      Courses & Classes Hub
                    </h2>
                    <p className="text-xs text-slate-400">Learn ICT with Mano - Manage and organize all your classes here.</p>
                  </div>
                  <button
                    onClick={() => setShowAddCourseModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Create New Course</span>
                  </button>
                </div>

                {loadingCourses ? (
                  <div className="p-16 text-center text-slate-400 text-sm">Loading courses...</div>
                ) : courses.length === 0 ? (
                  <div className="p-16 bg-[#0c1322] border border-slate-800 rounded-2xl text-center space-y-3">
                    <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
                    <h3 className="text-base font-bold text-white">No courses created yet</h3>
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
                              {c.category || 'ICT'} • {c.type || 'Theory'}
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
                              <span>{c.studentCount || 0} Students</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Film className="w-3.5 h-3.5 text-red-400" />
                              <span>{c.recordingCount || 0} Recordings</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => handleSelectCourseToManage(c)}
                            className="flex-1 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <span>⚙️ Manage Course</span>
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(c.id, c.title)}
                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/50 transition cursor-pointer"
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

        {/* TAB 2: STUDENTS */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex border-b border-slate-800 gap-4">
              <button
                onClick={() => setStudentSubTab('list')}
                className={`pb-3 text-sm font-semibold transition border-b-2 cursor-pointer ${
                  studentSubTab === 'list' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                📋 Class-wise Students
              </button>
              <button
                onClick={() => setStudentSubTab('register')}
                className={`pb-3 text-sm font-semibold transition border-b-2 cursor-pointer ${
                  studentSubTab === 'register' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                ➕ Student Registration
              </button>
            </div>

            {studentSubTab === 'register' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 bg-[#0c1322] border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">👤</span>
                    <div>
                      <h2 className="text-lg font-bold">New Student Registration</h2>
                      <p className="text-xs text-slate-400">Generate credentials and enroll paying students into designated classes.</p>
                    </div>
                  </div>

                  {formError && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      ⚠️ {formError}
                    </div>
                  )}

                  <form onSubmit={handleCreateStudent} className="space-y-5">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Student Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kasun Perera"
                        value={fullName}
                        onChange={handleNameChange}
                        className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Username *</label>
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
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">WhatsApp Mobile Number</label>
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
                        <label className="text-xs font-medium text-slate-300">Temporary Password *</label>
                        <button type="button" onClick={generateRandomPassword} className="text-xs text-purple-400 hover:underline cursor-pointer">
                          🔄 Generate New Password
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
                      <label className="block text-xs font-medium text-slate-300 mb-2">Select Courses *</label>
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
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? 'Registering Student...' : '+ Register & Enroll Student'}
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-6">
                  {createdStudentData ? (
                    <div className="bg-[#0c1322] border border-emerald-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                      <div className="flex items-center gap-3 text-emerald-400 mb-4">
                        <span className="text-xl">✅</span>
                        <h3 className="font-bold text-base">Student Successfully Registered!</h3>
                      </div>
                      <div className="bg-[#131c31] p-4 rounded-xl border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-line leading-relaxed mb-4">
                        {generateWhatsAppMessage()}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generateWhatsAppMessage());
                            alert('WhatsApp credentials copied to clipboard!');
                          }}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition text-center cursor-pointer"
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
                      <p className="text-xs max-w-xs mt-1">Ready-to-send credentials will automatically populate here upon student creation.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {studentSubTab === 'list' && (
              <div className="space-y-6">
                {/* Course Switcher Pills */}
                <div className="flex flex-wrap items-center gap-2 bg-[#0c1322] p-2 rounded-2xl border border-slate-800">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedFilterCourse(course.id.toString())}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        selectedFilterCourse === course.id.toString()
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-[#131c31] text-slate-400 hover:text-white'
                      }`}
                    >
                      📚 {course.title}
                    </button>
                  ))}
                </div>

                {/* Filter and Search Bar with Paid/Unpaid Tabs */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#0c1322] p-4 rounded-2xl border border-slate-800 shadow-xl">
                  {/* Quick Payment Status Filter Pills */}
                  <div className="flex items-center gap-2 bg-[#131c31] p-1.5 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setPaymentFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        paymentFilter === 'all'
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      👥 All Students ({totalCount})
                    </button>

                    <button
                      onClick={() => setPaymentFilter('paid')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        paymentFilter === 'paid'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'text-emerald-400/80 hover:text-emerald-300'
                      }`}
                    >
                      <span>✅ Paid ({currentMonthName})</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold">
                        {paidCount}
                      </span>
                    </button>

                    <button
                      onClick={() => setPaymentFilter('unpaid')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        paymentFilter === 'unpaid'
                          ? 'bg-amber-500 text-slate-950 font-bold shadow'
                          : 'text-amber-400/90 hover:text-amber-300'
                      }`}
                    >
                      <span>⚠ Unpaid ({currentMonthName})</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-amber-300 text-[10px] font-bold">
                        {unpaidCount}
                      </span>
                    </button>
                  </div>

                  {/* Search box & Refresh */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 sm:w-72">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search by Name, Username, Phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#131c31] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <button
                      onClick={() => selectedFilterCourse && fetchStudentsForCourse(selectedFilterCourse)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Refresh"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Students Table */}
                <div className="bg-[#0c1322] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                  {loadingStudents ? (
                    <div className="p-16 text-center text-slate-400 text-sm">Loading student records...</div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="p-16 text-center text-slate-500 text-sm space-y-2">
                      <Users className="w-10 h-10 text-slate-700 mx-auto" />
                      <div>
                        {paymentFilter === 'unpaid'
                          ? `Great! All enrolled students have paid their dues for ${currentMonthName}.`
                          : 'No students found matching this criteria.'}
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-[#131c31] text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="py-3.5 px-4">Student</th>
                            <th className="py-3.5 px-4">Username</th>
                            <th className="py-3.5 px-4">Password</th>
                            <th className="py-3.5 px-4">Phone Number</th>
                            <th className="py-3.5 px-4">Device</th>
                            <th className="py-3.5 px-4">Monthly Access Status ({currentMonthName})</th>
                            <th className="py-3.5 px-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {filteredStudents.map((st) => {
                            const isPwdVisible = !!showPasswordMap[st.userId];
                            const isSuspended = st.status === 'inactive' || st.status === 'suspended';

                            return (
                              <tr key={st.userId} className={`transition ${
                                !st.isPaidForCurrentMonth ? 'bg-amber-950/10 hover:bg-amber-950/20' : 'hover:bg-slate-800/30'
                              }`}>
                                <td className="py-3.5 px-4 font-semibold text-white">
                                  {st.fullName}
                                  {!st.isPaidForCurrentMonth && (
                                    <span className="ml-2 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                                      UNPAID
                                    </span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4 font-mono text-purple-400">@{st.username}</td>
                                
                                {/* Password with Eye & Copy */}
                                <td className="py-3.5 px-4">
                                  <div className="inline-flex items-center gap-2 bg-[#0c1322] px-2.5 py-1 rounded-lg border border-slate-700/60 font-mono text-[11px]">
                                    <span className={isPwdVisible ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                                      {isPwdVisible ? st.password : '••••••••'}
                                    </span>
                                    <div className="flex items-center gap-1 border-l border-slate-700 pl-1.5 ml-1">
                                      <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility(st.userId)}
                                        className="text-slate-400 hover:text-white transition p-0.5 cursor-pointer"
                                        title={isPwdVisible ? 'Hide Password' : 'Show Password'}
                                      >
                                        {isPwdVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(st.password);
                                          alert(`Password for @${st.username} copied to clipboard!`);
                                        }}
                                        className="text-slate-400 hover:text-emerald-400 transition p-0.5 cursor-pointer"
                                        title="Copy Password"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  {st.phone ? (
                                    <a
                                      href={`https://wa.me/94${st.phone.replace(/^0/, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-emerald-400 hover:underline flex items-center gap-1 font-mono"
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

                                {/* Monthly Status Display */}
                                <td className="py-3.5 px-4">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                        isSuspended
                                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                          : st.isPaidForCurrentMonth
                                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      }`}>
                                        {isSuspended ? '⛔ Suspended' : st.isPaidForCurrentMonth ? '✅ Paid' : '⚠️ Unpaid'}
                                      </span>
                                    </div>

                                    <span className={`text-[11px] font-medium ${
                                      isSuspended
                                        ? 'text-red-400'
                                        : st.isPaidForCurrentMonth
                                        ? 'text-emerald-400'
                                        : 'text-amber-400'
                                    }`}>
                                      {st.monthStatusText}
                                    </span>
                                  </div>
                                </td>

                                {/* Actions */}
                                <td className="py-3.5 px-4">
                                  <div className="flex flex-wrap items-center justify-center gap-2">
                                    {st.phone && (
                                      <a
                                        href={getWhatsAppUrl(st)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition flex items-center gap-1.5 cursor-pointer shadow ${
                                          !st.isPaidForCurrentMonth
                                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold animate-pulse'
                                            : 'bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 border border-slate-700'
                                        }`}
                                        title={
                                          !st.isPaidForCurrentMonth
                                            ? `Send fee reminder message to ${st.fullName}`
                                            : `Open WhatsApp chat with ${st.fullName}`
                                        }
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>{!st.isPaidForCurrentMonth ? '💬 Send Reminder' : '💬 WhatsApp Chat'}</span>
                                      </a>
                                    )}

                                    <button
                                      disabled={actionLoadingId === `month_current_month_${st.userId}`}
                                      onClick={() => handleActivateMonth(st, 'current_month')}
                                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition shadow cursor-pointer disabled:opacity-50"
                                      title={`Activate access for ${currentMonthName}`}
                                    >
                                      {actionLoadingId === `month_current_month_${st.userId}` ? '...' : `🗓️ ${currentMonthName} (+Active)`}
                                    </button>

                                    <button
                                      disabled={actionLoadingId === `month_next_month_${st.userId}`}
                                      onClick={() => handleActivateMonth(st, 'next_month')}
                                      className="px-2.5 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 font-semibold text-[11px] transition cursor-pointer disabled:opacity-50"
                                      title={`Extend access through ${nextMonthName}`}
                                    >
                                      {actionLoadingId === `month_next_month_${st.userId}` ? '...' : `+ ${nextMonthName}`}
                                    </button>

                                    <button
                                      disabled={actionLoadingId === `status_${st.userId}`}
                                      onClick={() => handleToggleStatus(st)}
                                      className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold transition border cursor-pointer disabled:opacity-50 ${
                                        st.status === 'active'
                                          ? 'bg-red-500/10 hover:bg-red-600 hover:text-white text-red-400 border-red-500/30'
                                          : 'bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-400 border-emerald-500/30'
                                      }`}
                                    >
                                      {actionLoadingId === `status_${st.userId}` ? '...' : st.status === 'active' ? '⛔ Suspend' : '🔓 Activate'}
                                    </button>

                                    {st.deviceId && (
                                      <button
                                        disabled={actionLoadingId === `reset_${st.userId}`}
                                        onClick={() => handleResetDevice(st)}
                                        className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 text-[11px] cursor-pointer"
                                        title="Reset Device Locking"
                                      >
                                        🔄 Reset
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

        {/* TAB 3: DEVICES */}
        {activeTab === 'devices' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-[#0c1322] border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
                <div>
                  <div className="text-xs text-slate-400">Total Registered Students</div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">{deviceStats.totalStudents}</div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#0c1322] border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
                <div>
                  <div className="text-xs text-slate-400">Locked Devices (Active)</div>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{deviceStats.lockedCount}</div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#0c1322] border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
                <div>
                  <div className="text-xs text-slate-400">Unlocked / Awaiting Login</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{deviceStats.unlockedCount}</div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Unlock className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0c1322] border border-slate-800 p-5 rounded-2xl shadow-xl">
              <div className="flex-1 w-full sm:max-w-md relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search student by Name, Username (@) or Phone..."
                  value={searchDeviceQuery}
                  onChange={(e) => setSearchDeviceQuery(e.target.value)}
                  className="w-full bg-[#131c31] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={fetchDevicesData}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleBulkResetAll}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-600/10 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 text-xs font-semibold transition cursor-pointer"
                >
                  🔓 Bulk Reset All Devices
                </button>
              </div>
            </div>

            <div className="bg-[#0c1322] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              {loadingDevices ? (
                <div className="p-16 text-center text-slate-400 text-sm">Loading device information...</div>
              ) : filteredDevices.length === 0 ? (
                <div className="p-16 text-center text-slate-500 text-sm">No students found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#131c31] text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Student</th>
                        <th className="py-3.5 px-4">Username</th>
                        <th className="py-3.5 px-4">Phone Number</th>
                        <th className="py-3.5 px-4">Device Status</th>
                        <th className="py-3.5 px-4">Device Identifier</th>
                        <th className="py-3.5 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredDevices.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3.5 px-4 font-semibold text-white">{st.fullName}</td>
                          <td className="py-3.5 px-4 font-mono text-purple-400">@{st.username}</td>
                          <td className="py-3.5 px-4">
                            {st.phone ? (
                              <a
                                href={`https://wa.me/94${st.phone.replace(/^0/, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:underline flex items-center gap-1"
                              >
                                <PhoneCall className="w-3 h-3" /> {st.phone}
                              </a>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {st.isLocked ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-[10px]">
                                🔒 Locked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]">
                                🔓 Unlocked
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">
                            {st.deviceId ? `${st.deviceId.substring(0, 16)}...` : 'No device locked'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {st.isLocked ? (
                              <button
                                disabled={actionLoadingId === st.id}
                                onClick={() => handleResetSingleDevice(st)}
                                className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 font-semibold text-[11px] transition cursor-pointer shadow-md disabled:opacity-50"
                              >
                                {actionLoadingId === st.id ? 'Resetting...' : '🔓 Reset Device'}
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-600">Ready to Login</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SLIP APPROVALS */}
        {activeTab === 'slips' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-[#0c1322] border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
                <div>
                  <div className="text-xs text-slate-400">Total Slips</div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">{slipStats.total}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#0c1322] border border-amber-500/30 p-5 rounded-2xl flex items-center justify-between shadow-xl">
                <div>
                  <div className="text-xs text-amber-400 font-semibold">Pending Review</div>
                  <div className="text-2xl font-bold font-mono text-amber-300 mt-1">{slipStats.pending}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#0c1322] border border-emerald-500/20 p-5 rounded-2xl flex items-center justify-between shadow-xl">
                <div>
                  <div className="text-xs text-slate-400">Approved</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{slipStats.approved}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#0c1322] border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
                <div>
                  <div className="text-xs text-slate-400">Rejected</div>
                  <div className="text-2xl font-bold font-mono text-red-400 mt-1">{slipStats.rejected}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                  <X className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0c1322] border border-slate-800 p-4 rounded-2xl shadow-xl">
              <div className="flex items-center gap-2 bg-[#131c31] p-1.5 rounded-xl border border-slate-800 w-full sm:w-auto">
                <button
                  onClick={() => setSlipFilter('pending')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    slipFilter === 'pending' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>⏳ Pending Review</span>
                  {slipStats.pending > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-amber-300 text-[10px] font-bold">
                      {slipStats.pending}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setSlipFilter('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    slipFilter === 'all' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({slipStats.total})
                </button>
                <button
                  onClick={() => setSlipFilter('approved')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    slipFilter === 'approved' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Approved ({slipStats.approved})
                </button>
                <button
                  onClick={() => setSlipFilter('rejected')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    slipFilter === 'rejected' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Rejected ({slipStats.rejected})
                </button>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by student or class..."
                    value={searchSlipQuery}
                    onChange={(e) => setSearchSlipQuery(e.target.value)}
                    className="w-full bg-[#131c31] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  onClick={fetchSlipsData}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Refresh"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {loadingSlips ? (
              <div className="p-16 text-center text-slate-400 text-sm">Loading deposit slips...</div>
            ) : filteredSlips.length === 0 ? (
              <div className="p-16 bg-[#0c1322] border border-slate-800 rounded-2xl text-center space-y-3">
                <CreditCard className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No slips found in this category</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSlips.map((slip) => {
                  const formattedDate = new Date(slip.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={slip.id}
                      className="bg-[#0c1322] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              slip.status === 'pending'
                                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                                : slip.status === 'approved'
                                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                : 'bg-red-500/10 border border-red-500/30 text-red-400'
                            }`}
                          >
                            {slip.status === 'pending' ? '⏳ Review Pending' : slip.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                          </span>
                          <span className="text-[10px] text-slate-500">{formattedDate}</span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white">{slip.studentName}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                            <span className="font-mono text-purple-400">@{slip.studentUsername}</span>
                            {slip.studentPhone && (
                              <a
                                href={`https://wa.me/94${slip.studentPhone.replace(/^0/, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                              >
                                💬 {slip.studentPhone}
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#131c31] border border-slate-800 space-y-1 text-xs">
                          <div className="text-slate-400 text-[10px]">Associated Course:</div>
                          <div className="font-semibold text-slate-200 line-clamp-1">{slip.course_name || 'Class'}</div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                            <span className="text-[10px] text-slate-400">Paid Amount:</span>
                            <span className="font-mono font-bold text-emerald-400">Rs. {slip.amount || '0'}/-</span>
                          </div>
                        </div>

                        <div
                          onClick={() => setPreviewSlip(slip)}
                          className="relative aspect-video rounded-xl bg-slate-900 border border-slate-800 overflow-hidden cursor-pointer group flex items-center justify-center"
                        >
                          <img
                            src={slip.slip_url}
                            alt="Bank Slip"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-xs text-white font-semibold">
                            <Eye className="w-4 h-4" />
                            <span>Preview Slip</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80">
                        {slip.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              disabled={processingSlipId === slip.id}
                              onClick={() => handleApproveSlip(slip)}
                              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{processingSlipId === slip.id ? 'Approving...' : 'Approve Access'}</span>
                            </button>
                            <button
                              disabled={processingSlipId === slip.id}
                              onClick={() => handleRejectSlip(slip)}
                              className="p-2.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/60 rounded-xl transition cursor-pointer"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between py-1 text-[11px] text-slate-500">
                            <span>{slip.status === 'approved' ? 'This slip has been approved.' : 'This slip was rejected.'}</span>
                            <button
                              disabled={processingSlipId === slip.id}
                              onClick={() => handleDeleteSlip(slip)}
                              className="px-2.5 py-1 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 shadow-sm"
                              title="Delete Slip"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
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

      {/* MODAL: PREVIEW SLIP */}
      {previewSlip && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c1322] border border-slate-800 max-w-2xl w-full rounded-3xl p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPreviewSlip(null)}
              className="absolute right-5 top-5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between pr-8">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  Bank Deposit Slip Review
                </h3>
                <p className="text-xs text-slate-400">
                  {previewSlip.studentName} (@{previewSlip.studentUsername}) • {previewSlip.course_name}
                </p>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                Rs. {previewSlip.amount}/-
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 flex items-center justify-center max-h-[60vh]">
              <img
                src={previewSlip.slip_url}
                alt="Full Slip Preview"
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <a
                href={previewSlip.slip_url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Original File</span>
              </a>

              {previewSlip.status === 'pending' ? (
                <div className="flex items-center gap-2">
                  <button
                    disabled={processingSlipId === previewSlip.id}
                    onClick={() => handleRejectSlip(previewSlip)}
                    className="px-4 py-2.5 rounded-xl bg-red-600/10 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 text-xs font-bold transition cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    disabled={processingSlipId === previewSlip.id}
                    onClick={() => handleApproveSlip(previewSlip)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    {processingSlipId === previewSlip.id ? 'Approving...' : '✅ Approve Access'}
                  </button>
                </div>
              ) : (
                <button
                  disabled={processingSlipId === previewSlip.id}
                  onClick={() => handleDeleteSlip(previewSlip)}
                  className="px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Slip</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📝 MODAL: GRADING & SUBMISSIONS VIEWER */}
      {gradingModalAssignment && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c1322] border border-slate-800 max-w-3xl w-full rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setGradingModalAssignment(null)}
              className="absolute right-5 top-5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-800 pr-8">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {gradingModalAssignment.title}
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                    Max Marks: {gradingModalAssignment.total_marks}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Review student answer sheets and submit graded marks</p>
              </div>
            </div>

            {loadingSubmissions ? (
              <div className="p-12 text-center text-slate-400 text-xs">Loading submitted answer sheets...</div>
            ) : assignmentSubmissionsList.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#131c31] border border-dashed border-slate-800 text-center space-y-2">
                <Award className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-300">No submissions received yet</h4>
                <p className="text-xs text-slate-500">Student answer sheets will appear here once submitted.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs text-slate-400 font-semibold">
                  Submitted Answer Sheets: <strong className="text-emerald-400 font-mono">{assignmentSubmissionsList.length}</strong>
                </div>

                <div className="space-y-3">
                  {assignmentSubmissionsList.map((sub) => {
                    const formattedDate = new Date(sub.submitted_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    const isGraded = sub.marks !== null && sub.marks !== undefined;
                    const isEditing = editingSubId === sub.id;

                    return (
                      <div key={sub.id} className="p-4 rounded-2xl bg-[#131c31] border border-slate-800 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{sub.studentName}</span>
                              <span className="font-mono text-purple-400 text-[11px]">@{sub.studentUsername}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                isGraded
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}>
                                {isGraded ? `✅ Graded (${sub.marks}/${gradingModalAssignment.total_marks})` : '⏳ Review Pending'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              📅 Submitted on: {formattedDate}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {sub.studentPhone && (
                              <a
                                href={`https://wa.me/94${sub.studentPhone.replace(/[^0-9]/g, '').replace(/^0/, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-400 text-[11px] font-semibold transition border border-emerald-500/30 flex items-center gap-1"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                            )}

                            <a
                              href={sub.submission_file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition flex items-center gap-1.5 shadow"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>📄 View Answer Sheet</span>
                            </a>
                          </div>
                        </div>

                        {isGraded && !isEditing ? (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#0c1322] border border-slate-800/80">
                            <div className="flex flex-wrap items-center gap-4 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 font-semibold">Awarded Marks:</span>
                                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs">
                                  {sub.marks} / {gradingModalAssignment.total_marks}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-300">
                                <span className="text-slate-400 font-semibold">Feedback:</span>
                                <span className="text-slate-200 italic font-mono text-[11px]">
                                  {sub.feedback ? `"${sub.feedback}"` : <span className="text-slate-500 not-italic">No feedback added</span>}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                                <Lock className="w-3 h-3 text-amber-400" />
                                <span>Locked</span>
                              </span>
                              <button
                                onClick={() => setEditingSubId(sub.id)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                                title="Change marks if needed"
                              >
                                <span>✏️ Edit</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-semibold text-slate-300 shrink-0">Marks:</label>
                              <input
                                type="number"
                                placeholder="Marks"
                                value={marksInputMap[sub.id] ?? ''}
                                onChange={(e) => setMarksInputMap(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                className="w-20 bg-[#0c1322] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500 text-center"
                              />
                              <span className="text-xs text-slate-500 font-mono">/ {gradingModalAssignment.total_marks}</span>
                            </div>

                            <div className="flex-1">
                              <input
                                type="text"
                                placeholder="Teacher Feedback (e.g. Excellent work! / Revise Question 3)"
                                value={feedbackInputMap[sub.id] ?? ''}
                                onChange={(e) => setFeedbackInputMap(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                className="w-full bg-[#0c1322] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                disabled={savingMarksId === sub.id}
                                onClick={() => handleSaveMarks(sub)}
                                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5 shrink-0"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{savingMarksId === sub.id ? 'Saving...' : isEditing ? 'Update & Lock' : 'Save Marks'}</span>
                              </button>

                              {isEditing && (
                                <button
                                  onClick={() => setEditingSubId(null)}
                                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs rounded-xl transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW COURSE */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1322] border border-slate-800 max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddCourseModal(false)}
              className="absolute right-5 top-5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                Create New Course
              </h3>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1.5">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 8 ICT - Theory & Practical"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1.5">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="Grade 8 ICT"
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value)}
                    className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1.5">Course Type *</label>
                  <select
                    value={newCourseType}
                    onChange={(e) => setNewCourseType(e.target.value)}
                    className="w-full bg-[#131c31] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                    <option value="Revision">Revision</option>
                    <option value="Paper">Paper Class</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1.5">Monthly Fee (Rs.) *</label>
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
                {creatingCourse ? 'Creating...' : '+ Save & Publish Course'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}