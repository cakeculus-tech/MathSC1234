import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  X, 
  BarChart3, 
  Edit3, 
  UploadCloud, 
  Download, 
  KeyRound, 
  Check, 
  RotateCcw, 
  AlertCircle, 
  Users, 
  TrendingUp, 
  Search,
  Save,
  FileSpreadsheet,
  CheckCircle2,
  Filter,
  School,
  Layers,
  BookOpen,
  CheckSquare,
  XCircle,
  FileText,
  AlertTriangle,
  Eye,
  EyeOff,
  Award
} from 'lucide-react';
import { ClassStatistics, SchoolInfo, Student, SubjectType, StudentTaskStatus, TaskDefinitions, TaskItemStatus } from '../types';
import { extractUnitDefinitions, serializeCSV, getStudentTaskStatus } from '../utils/csvHelper';
import { DEFAULT_BASE_TASKS, DEFAULT_EXTRA_TASKS } from '../data/defaultData';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminLoggedIn: boolean;
  onLogin: (password: string) => boolean;
  baseStudents: Student[];
  extraStudents: Student[];
  baseHeaders: string[];
  extraHeaders: string[];
  customBaseHeaders: Record<number, string>;
  customExtraHeaders: Record<number, string>;
  onSaveCustomHeaders: (subject: SubjectType, headers: Record<number, string>) => void;
  onResetCustomHeaders: (subject: SubjectType) => void;
  customBaseUnitTitles: Record<string, string>;
  customExtraUnitTitles: Record<string, string>;
  onSaveCustomUnitTitles: (subject: SubjectType, unitTitles: Record<string, string>) => void;
  onResetCustomUnitTitles: (subject: SubjectType) => void;
  baseTasks: TaskDefinitions;
  extraTasks: TaskDefinitions;
  onSaveTasks: (subject: SubjectType, tasks: TaskDefinitions) => void;
  baseSubmissions: Record<string, StudentTaskStatus>;
  extraSubmissions: Record<string, StudentTaskStatus>;
  onToggleStudentTask: (subject: SubjectType, studentId: string, taskKey: 'task1' | 'task2') => void;
  onSetStudentTaskStatus: (subject: SubjectType, studentId: string, taskKey: 'task1' | 'task2', status: TaskItemStatus) => void;
  onSetAllStudentTasks: (subject: SubjectType, taskKey: 'task1' | 'task2', status: TaskItemStatus) => void;
  onUploadCSV: (subject: SubjectType, csvText: string) => void;
  onResetToDefaults: () => void;
  baseStats: ClassStatistics;
  extraStats: ClassStatistics;
  onChangePassword: (newPass: string) => void;
  onUpdateStudentScore: (subject: SubjectType, studentId: string, colIndex: number, newScore: string) => void;
  schoolInfo: SchoolInfo;
  onSaveSchoolInfo: (info: SchoolInfo) => void;
  gradeVisibility: Record<SubjectType, boolean>;
  onToggleGradeVisibility: (subject: SubjectType) => void;
  onSetGradeVisibility: (subject: SubjectType, visible: boolean) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdminLoggedIn,
  onLogin,
  baseStudents,
  extraStudents,
  baseHeaders,
  extraHeaders,
  customBaseHeaders,
  customExtraHeaders,
  onSaveCustomHeaders,
  onResetCustomHeaders,
  customBaseUnitTitles,
  customExtraUnitTitles,
  onSaveCustomUnitTitles,
  onResetCustomUnitTitles,
  baseTasks,
  extraTasks,
  onSaveTasks,
  baseSubmissions,
  extraSubmissions,
  onToggleStudentTask,
  onSetStudentTaskStatus,
  onSetAllStudentTasks,
  onUploadCSV,
  onResetToDefaults,
  baseStats,
  extraStats,
  onChangePassword,
  onUpdateStudentScore,
  schoolInfo,
  onSaveSchoolInfo,
  gradeVisibility,
  onToggleGradeVisibility,
  onSetGradeVisibility,
}) => {
  // Login form state
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active admin tab: 'school' | 'gradebook' | 'units' | 'tasks' | 'display' | 'analytics' | 'headers' | 'csv' | 'security'
  const [activeTab, setActiveTab] = useState<'school' | 'gradebook' | 'units' | 'tasks' | 'display' | 'analytics' | 'headers' | 'csv' | 'security'>('gradebook');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('base');

  // School & Teacher editing state
  const [schoolForm, setSchoolForm] = useState<SchoolInfo>(schoolInfo);

  useEffect(() => {
    setSchoolForm(schoolInfo);
  }, [schoolInfo]);

  // Headers editing local state
  const [editingHeaders, setEditingHeaders] = useState<Record<number, string>>({});

  // Units editing local state
  const [editingUnitTitles, setEditingUnitTitles] = useState<Record<string, string>>({});

  const currentCustomUnitTitles = selectedSubject === 'base' ? customBaseUnitTitles : customExtraUnitTitles;

  // Extract detected units for current subject
  const currentUnits = useMemo(() => {
    const activeHeaders = selectedSubject === 'base' ? baseHeaders : extraHeaders;
    const currentCustomH = selectedSubject === 'base' ? customBaseHeaders : customExtraHeaders;
    return extractUnitDefinitions(activeHeaders, currentCustomH);
  }, [selectedSubject, baseHeaders, extraHeaders, customBaseHeaders, customExtraHeaders]);

  // Sync editingUnitTitles whenever currentUnits or currentCustomUnitTitles changes
  useEffect(() => {
    const map: Record<string, string> = {};
    currentUnits.forEach((u) => {
      map[u.id] = currentCustomUnitTitles[u.id] !== undefined ? currentCustomUnitTitles[u.id] : u.defaultTitle;
    });
    setEditingUnitTitles(map);
  }, [currentUnits, currentCustomUnitTitles, selectedSubject]);

  const handleSaveUnitTitles = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveCustomUnitTitles(selectedSubject, editingUnitTitles);
    triggerSavedFeedback(`บันทึกแล้ว: บันทึกชื่อหน่วยการเรียนรู้วิชา${selectedSubject === 'base' ? 'พื้นฐาน' : 'เพิ่มเติม'} เรียบร้อยแล้ว`);
  };

  const handleResetUnitTitles = () => {
    if (confirm(`ต้องการคืนค่าชื่อหน่วยการเรียนรู้วิชา${selectedSubject === 'base' ? 'พื้นฐาน' : 'เพิ่มเติม'} เป็นค่าเริ่มต้นหรือไม่?`)) {
      onResetCustomUnitTitles(selectedSubject);
      const map: Record<string, string> = {};
      currentUnits.forEach((u) => {
        map[u.id] = u.defaultTitle;
      });
      setEditingUnitTitles(map);
      triggerSavedFeedback('บันทึกแล้ว: รีเซ็ตชื่อหน่วยการเรียนรู้เป็นค่าเริ่มต้นเรียบร้อยแล้ว');
    }
  };

  // Tasks state and handlers
  const currentTasks = selectedSubject === 'base' ? baseTasks : extraTasks;
  const currentSubmissions = selectedSubject === 'base' ? baseSubmissions : extraSubmissions;
  const [taskForm, setTaskForm] = useState<TaskDefinitions>({ task1: '', task2: '' });

  useEffect(() => {
    setTaskForm({ ...currentTasks });
  }, [currentTasks, selectedSubject]);

  const handleSaveTasksSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!taskForm.task1.trim() || !taskForm.task2.trim()) return;
    onSaveTasks(selectedSubject, {
      task1: taskForm.task1.trim(),
      task2: taskForm.task2.trim(),
    });
    triggerSavedFeedback(`บันทึกแล้ว: บันทึกชื่องาน 2 ชิ้น วิชา${selectedSubject === 'base' ? 'พื้นฐาน' : 'เพิ่มเติม'} เรียบร้อยแล้ว`);
  };

  const handleResetTasksSubmit = () => {
    const defaults = selectedSubject === 'base' ? DEFAULT_BASE_TASKS : DEFAULT_EXTRA_TASKS;
    setTaskForm({ ...defaults });
    onSaveTasks(selectedSubject, defaults);
    triggerSavedFeedback('บันทึกแล้ว: คืนค่าชื่องานเริ่มต้นเรียบร้อยแล้ว');
  };


  // Security tab state
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passSuccessMsg, setPassSuccessMsg] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState('');

  // Gradebook search & class room filter state
  const [gradebookQuery, setGradebookQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  
  // Persistent save feedback notification message: "บันทึกแล้ว"
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerSavedFeedback = (msg: string = 'บันทึกแล้ว') => {
    setSavedFeedback(msg);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setSavedFeedback(null);
    }, 4000);
  };

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(passwordInput)) {
      setPasswordInput('');
      setLoginError('');
    } else {
      setLoginError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Sync editing headers when tab or subject changes
  const initEditingHeaders = (subj: SubjectType) => {
    const activeHeaders = subj === 'base' ? baseHeaders : extraHeaders;
    const currentCustom = subj === 'base' ? customBaseHeaders : customExtraHeaders;
    const initialMap: Record<number, string> = {};
    for (let i = 4; i < activeHeaders.length; i++) {
      initialMap[i] = currentCustom[i] !== undefined ? currentCustom[i] : activeHeaders[i];
    }
    setEditingHeaders(initialMap);
  };

  const handleSubjectChangeForHeaders = (subj: SubjectType) => {
    setSelectedSubject(subj);
    initEditingHeaders(subj);
  };

  // Handle Save School and Teacher Info
  const handleSaveSchoolInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSchoolInfo(schoolForm);
    triggerSavedFeedback('บันทึกแล้ว: บันทึกชื่อโรงเรียนและครูผู้สอนเรียบร้อยแล้ว');
  };

  // Handle Header Save
  const handleSaveHeaders = () => {
    onSaveCustomHeaders(selectedSubject, editingHeaders);
    triggerSavedFeedback('บันทึกแล้ว: บันทึกการแก้ไขชื่อหัวข้อเรียบร้อยแล้ว');
  };

  // Handle CSV Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, subject: SubjectType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onUploadCSV(subject, content);
        triggerSavedFeedback(`บันทึกแล้ว: อัปเดตไฟล์ข้อมูล CSV สำหรับวิชา${subject === 'base' ? 'พื้นฐาน' : 'เพิ่มเติม'} เรียบร้อยแล้ว`);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Handle Download CSV
  const handleDownloadCSV = (subject: SubjectType) => {
    const headers = subject === 'base' ? baseHeaders : extraHeaders;
    const students = subject === 'base' ? baseStudents : extraStudents;
    const rows = students.map(s => {
      const row = [s.id, s.name, s.class, s.no];
      for (let i = 4; i < headers.length; i++) {
        row.push(s.scores[i] || '');
      }
      return row;
    });

    const csvContent = serializeCSV(headers, rows);
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gradebook_${subject}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Save Password
  const handleSavePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccessMsg('');
    setPassErrorMsg('');

    if (!newPass.trim()) {
      setPassErrorMsg('กรุณากรอกรหัสผ่านใหม่');
      return;
    }
    if (newPass !== confirmPass) {
      setPassErrorMsg('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }

    onChangePassword(newPass.trim());
    setPassSuccessMsg('บันทึกแล้ว: เปลี่ยนรหัสผ่านแอดมินสำเร็จแล้ว!');
    triggerSavedFeedback('บันทึกแล้ว: บันทึกรหัสผ่านใหม่เรียบร้อยแล้ว');
    setNewPass('');
    setConfirmPass('');
  };

  // Current stats & students for active tab
  const currentStats = selectedSubject === 'base' ? baseStats : extraStats;
  const currentStudents = selectedSubject === 'base' ? baseStudents : extraStudents;
  const currentHeaders = selectedSubject === 'base' ? baseHeaders : extraHeaders;

  // Extract unique classes for Class Filter (ตัวกรองห้อง)
  const availableClasses = useMemo(() => {
    const classes = Array.from(new Set(currentStudents.map(s => s.class).filter(Boolean)));
    return classes.sort();
  }, [currentStudents]);

  // Filter students based on room and search query
  const filteredStudentsForGradebook = useMemo(() => {
    return currentStudents.filter(s => {
      const matchesClass = selectedClassFilter === 'all' || s.class === selectedClassFilter;
      const q = gradebookQuery.trim().toLowerCase();
      const matchesQuery = !q || 
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.no.includes(q);
      return matchesClass && matchesQuery;
    });
  }, [currentStudents, selectedClassFilter, gradebookQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base font-heading">
                ศูนย์จัดการระบบและประเมินผลการเรียน (Teacher Admin Hub)
              </h2>
              <p className="text-[11px] text-slate-400">
                ระบบจัดการคะแนนนักเรียน ปรับแต่งหัวข้อ และวิเคราะห์ข้อมูลผลสัมฤทธิ์
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If NOT logged in: Show Login Screen */}
        {!isAdminLoggedIn ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-indigo-50/50">
              <KeyRound className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 font-heading">เข้าสู่ระบบสำหรับคุณครู</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              กรุณากรอกรหัสผ่านเพื่อเข้าใช้งานเมนูจัดการคะแนนและตั้งค่าระบบ
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  รหัสผ่านแอดมิน (Admin Password)
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="กรอกรหัสผ่าน (ค่าเริ่มต้น: admin123)"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  autoFocus
                />
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-800">
                💡 <strong>รหัสผ่านเริ่มต้นสำหรับทดสอบระบบ:</strong> <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-bold">admin123</code> (สามารถเปลี่ยนได้ภายหลัง)
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer"
                >
                  เข้าสู่ระบบ
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* When Logged In: Full Admin Dashboard with Tabs */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Navigation Tabs */}
            <div className="bg-slate-100/90 border-b border-slate-200 px-3 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-2.5 py-2.5 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                <button
                  onClick={() => setActiveTab('gradebook')}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeTab === 'gradebook'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  <span>สมุดบันทึกคะแนน</span>
                </button>

                <button
                  onClick={() => setActiveTab('units')}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeTab === 'units'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>ชื่อหน่วยการเรียนรู้</span>
                </button>

                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeTab === 'tasks'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  <span>ติดตามการส่งงาน (2 ชิ้น)</span>
                </button>

                <button
                  onClick={() => setActiveTab('display')}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeTab === 'display'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {gradeVisibility[selectedSubject] ? (
                    <Eye className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-amber-600" />
                  )}
                  <span>แสดง/ซ่อนเกรด</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    gradeVisibility[selectedSubject] ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {gradeVisibility[selectedSubject] ? 'แสดง' : 'ซ่อน'}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('school')}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeTab === 'school'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <School className="w-4 h-4 text-indigo-600" />
                  <span>ข้อมูลโรงเรียน & ครู</span>
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeTab === 'analytics'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  <span>สถิติภาพรวม</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('headers');
                    initEditingHeaders(selectedSubject);
                  }}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeTab === 'headers'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                  <span>ปรับแต่งชื่อหัวข้อ</span>
                </button>

                <button
                  onClick={() => setActiveTab('csv')}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeTab === 'csv'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <UploadCloud className="w-4 h-4 text-slate-500" />
                  <span>นำเข้า/ส่งออก CSV</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeTab === 'security'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <KeyRound className="w-4 h-4 text-slate-500" />
                  <span>ความปลอดภัย</span>
                </button>
              </div>

              {/* Subject Selector & Quick Grade Toggle within Admin */}
              <div className="flex items-center gap-2 shrink-0 self-start md:self-auto flex-wrap">
                <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedSubject('base');
                      if (activeTab === 'headers') initEditingHeaders('base');
                    }}
                    className={`min-h-[34px] px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      selectedSubject === 'base'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    วิชาพื้นฐาน
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSubject('extra');
                      if (activeTab === 'headers') initEditingHeaders('extra');
                    }}
                    className={`min-h-[34px] px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      selectedSubject === 'extra'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    วิชาเพิ่มเติม
                  </button>
                </div>

                {/* Quick Grade Toggle for current subject */}
                <button
                  type="button"
                  onClick={() => {
                    onToggleGradeVisibility(selectedSubject);
                    triggerSavedFeedback(
                      `บันทึกแล้ว: ${gradeVisibility[selectedSubject] ? 'ซ่อน' : 'เปิดแสดง'}เกรดวิชา${selectedSubject === 'base' ? 'พื้นฐาน' : 'เพิ่มเติม'} เรียบร้อยแล้ว`
                    );
                  }}
                  className={`min-h-[34px] px-3 py-1.5 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs ${
                    gradeVisibility[selectedSubject]
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  }`}
                  title={`คลิกเพื่อสลับแสดง/ซ่อนเกรดวิชา${selectedSubject === 'base' ? 'พื้นฐาน' : 'เพิ่มเติม'}`}
                >
                  {gradeVisibility[selectedSubject] ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>เกรด: แสดงผล</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                      <span>เกรด: ซ่อนอยู่</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Tab Body Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
              
              {/* Prominent Save Feedback Banner */}
              {savedFeedback && (
                <div className="mb-4 p-3 sm:p-3.5 bg-emerald-600 text-white rounded-xl shadow-md flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-1 transition-all">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
                    <span>{savedFeedback}</span>
                  </div>
                  <span className="bg-emerald-700/80 text-white px-2.5 py-1 rounded-md text-xs font-bold shrink-0">
                    ✓ บันทึกแล้ว
                  </span>
                </div>
              )}

              {/* TAB 0: SCHOOL & TEACHER INFO SETTINGS */}
              {activeTab === 'school' && (
                <div className="max-w-2xl mx-auto bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <School className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-slate-800 font-heading">
                        แก้ไขข้อมูลโรงเรียน & ชื่อครูผู้สอน
                      </h4>
                      <p className="text-xs text-slate-500">
                        ข้อมูลนี้จะแสดงผลบนแถบด้านบน หน้าแรกของระบบ และใบรายงานผลการเรียนของนักเรียน
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveSchoolInfoSubmit} className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ชื่อสถานศึกษา / โรงเรียน <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={schoolForm.schoolName}
                        onChange={(e) => setSchoolForm({ ...schoolForm, schoolName: e.target.value })}
                        placeholder="เช่น โรงเรียนมัธยมศึกษาตัวอย่าง..."
                        className="w-full min-h-[44px] bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ชื่อครูผู้สอน <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={schoolForm.teacherName}
                          onChange={(e) => setSchoolForm({ ...schoolForm, teacherName: e.target.value })}
                          placeholder="เช่น ครูเค้ก หรือ ชื่อ-นามสกุล..."
                          className="w-full min-h-[44px] bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          กลุ่มสาระการเรียนรู้
                        </label>
                        <input
                          type="text"
                          value={schoolForm.department}
                          onChange={(e) => setSchoolForm({ ...schoolForm, department: e.target.value })}
                          placeholder="เช่น กลุ่มสาระการเรียนรู้คณิตศาสตร์..."
                          className="w-full min-h-[44px] bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ระดับชั้น / ห้องเรียน
                        </label>
                        <input
                          type="text"
                          value={schoolForm.className}
                          onChange={(e) => setSchoolForm({ ...schoolForm, className: e.target.value })}
                          placeholder="เช่น มัธยมศึกษาปีที่ 1/6"
                          className="w-full min-h-[44px] bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ภาคเรียนที่
                        </label>
                        <input
                          type="text"
                          value={schoolForm.semester}
                          onChange={(e) => setSchoolForm({ ...schoolForm, semester: e.target.value })}
                          placeholder="เช่น 1 หรือ 2"
                          className="w-full min-h-[44px] bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ปีการศึกษา
                        </label>
                        <input
                          type="text"
                          value={schoolForm.academicYear}
                          onChange={(e) => setSchoolForm({ ...schoolForm, academicYear: e.target.value })}
                          placeholder="เช่น 2567"
                          className="w-full min-h-[44px] bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        อีเมลติดต่อครูผู้สอน
                      </label>
                      <input
                        type="email"
                        value={schoolForm.teacherEmail}
                        onChange={(e) => setSchoolForm({ ...schoolForm, teacherEmail: e.target.value })}
                        placeholder="เช่น krucakeculus@gmail.com"
                        className="w-full min-h-[44px] bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-2.5">
                      <button
                        type="submit"
                        className="min-h-[44px] px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>บันทึกการแก้ไข</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 1: ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {/* Summary KPI Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-xs font-semibold text-slate-500">นักเรียนทั้งหมด</span>
                      <p className="text-2xl font-bold text-slate-900 mt-1 font-heading">{currentStats.studentCount} คน</p>
                      <span className="text-[11px] text-slate-400">ในระบบ</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-xs font-semibold text-slate-500">คะแนนเฉลี่ยห้อง</span>
                      <p className="text-2xl font-bold text-indigo-600 mt-1 font-heading">{currentStats.averageScore}</p>
                      <span className="text-[11px] text-slate-400">จาก 100 คะแนน</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-xs font-semibold text-slate-500">คะแนนสูงสุด (Max)</span>
                      <p className="text-2xl font-bold text-emerald-600 mt-1 font-heading">{currentStats.maxScore}</p>
                      <span className="text-[11px] text-slate-400">คะแนน</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-xs font-semibold text-slate-500">คะแนนต่ำสุด (Min)</span>
                      <p className="text-2xl font-bold text-amber-600 mt-1 font-heading">{currentStats.minScore}</p>
                      <span className="text-[11px] text-slate-400">คะแนน</span>
                    </div>
                  </div>

                  {/* Grade Distribution Bar Visualizer */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between font-heading">
                      <span>การกระจายตัวของระดับผลการเรียน (Grade Distribution)</span>
                      <span className="text-xs font-normal text-slate-400">
                        วิชา{selectedSubject === 'base' ? 'พื้นฐาน' : 'เพิ่มเติม'}
                      </span>
                    </h4>

                    <div className="space-y-2.5">
                      {currentStats.gradeDistribution.map((item) => (
                        <div key={item.grade} className="flex items-center gap-3 text-xs">
                          <span className="w-14 font-bold text-slate-700 font-mono">เกรด {item.grade}</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-3.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                parseFloat(item.grade) >= 3.5
                                  ? 'bg-emerald-500'
                                  : parseFloat(item.grade) >= 2.5
                                  ? 'bg-indigo-500'
                                  : parseFloat(item.grade) >= 1.0
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.max(2, item.percentage)}%` }}
                            />
                          </div>
                          <span className="w-16 text-right font-medium text-slate-600">
                            {item.count} คน ({item.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top 5 Students */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 font-heading">
                      🏆 5 อันดับคะแนนสูงสุดประจำห้องเรียน
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {currentStats.topStudents.map((st, idx) => (
                        <div key={st.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-xs font-semibold text-slate-800">{st.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{st.id}</p>
                            </div>
                          </div>
                          <span className="font-bold text-sm text-indigo-700 font-mono">{st.score} คะแนน</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB: LEARNING UNITS EDITOR */}
              {activeTab === 'units' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-800 font-heading flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-600" />
                        แก้ไขชื่อหน่วยการเรียนรู้ - วิชา{selectedSubject === 'base' ? 'คณิตศาสตร์พื้นฐาน' : 'คณิตศาสตร์เพิ่มเติม'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        คุณครูสามารถระบุชื่อเนื้อหาหรือบทเรียนของแต่ละหน่วยการเรียนรู้ (เช่น <span className="font-semibold text-slate-700">หน่วยการเรียนรู้ที่ 1: ระบบจำนวนเต็ม</span>) โดยชื่อนี้จะไปปรากฏในการแจกแจงคะแนนของนักเรียนทันที
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleResetUnitTitles}
                        className="px-3.5 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        คืนค่าเริ่มต้น
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveUnitTitles()}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        บันทึกชื่อหน่วย
                      </button>
                    </div>
                  </div>

                  {/* Units List */}
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {currentUnits.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-xs font-medium text-slate-600">ไม่พบข้อมูลหน่วยการเรียนรู้ในหัวข้อของวิชานี้</p>
                      </div>
                    ) : (
                      currentUnits.map((u, idx) => {
                        const currentVal = editingUnitTitles[u.id] ?? u.defaultTitle;
                        const isModified = currentVal !== u.defaultTitle;

                        return (
                          <div
                            key={u.id}
                            className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all ${
                              isModified
                                ? 'border-indigo-300 shadow-xs ring-1 ring-indigo-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                                  {u.badge || `หน่วยที่ ${idx + 1}`}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                  ID: {u.id}
                                </span>
                                {isModified && (
                                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                    มีการกำหนดชื่อเอง
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500">
                                ประกอบด้วย {u.items.length} รายการประเมิน
                              </span>
                            </div>

                            {/* Title Input */}
                            <div className="mb-3">
                              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                ชื่อหน่วยการเรียนรู้ที่แสดงให้นักเรียนเห็น:
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={currentVal}
                                  onChange={(e) => {
                                    setEditingUnitTitles({
                                      ...editingUnitTitles,
                                      [u.id]: e.target.value,
                                    });
                                  }}
                                  placeholder={`เช่น ${u.defaultTitle}...`}
                                  className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium transition focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                                />
                                {currentVal !== u.defaultTitle && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingUnitTitles({
                                        ...editingUnitTitles,
                                        [u.id]: u.defaultTitle,
                                      });
                                    }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-rose-600 font-medium px-2 py-0.5 rounded hover:bg-slate-100 cursor-pointer"
                                    title="คืนค่าเป็นชื่อเริ่มต้น"
                                  >
                                    คืนค่าเดิม
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Contained Items preview */}
                            <div className="pt-2.5 border-t border-slate-100">
                              <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
                                รายการคะแนนที่สังกัดในหน่วยนี้ ({u.items.length}):
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {u.items.map((item) => (
                                  <span
                                    key={item.index}
                                    className="text-[11px] px-2 py-1 rounded-lg bg-slate-100/90 text-slate-700 border border-slate-200/70 flex items-center gap-1"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                    <span>{item.title}</span>
                                  </span>
                                ))}
                              </div>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Bottom Save bar */}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[11px] text-slate-500">
                      💡 เมื่อคลิก <strong>บันทึกชื่อหน่วย</strong> ข้อมูลจะถูกบันทึกในระบบและอัปเดตไปยังหน้ารายการคะแนนทันที
                    </p>
                    <button
                      type="button"
                      onClick={() => handleSaveUnitTitles()}
                      className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      บันทึกชื่อหน่วยการเรียนรู้
                    </button>
                  </div>

                </div>
              )}

              {/* TAB: TASKS (ติดตามการส่งงาน 2 ชิ้น และกำหนดชื่องาน) */}
              {activeTab === 'tasks' && (
                <div className="space-y-5">
                  {/* Header & Subject Switcher */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-800 font-heading flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ติดตามการส่งงาน (2 ชิ้น) & กำหนดชื่องาน
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        กำหนดชื่องาน 2 ชิ้นที่จะแสดงหลังชื่อนักเรียน พร้อมตรวจสอบและบันทึกสถานะการส่งงานของนักเรียนทุกคน
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedSubject('base')}
                        className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                          selectedSubject === 'base'
                            ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>วิชาพื้นฐาน (ค21101)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSubject('extra')}
                        className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                          selectedSubject === 'extra'
                            ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>วิชาเพิ่มเติม (ค21201)</span>
                      </button>
                    </div>
                  </div>

                  {/* Edit Task Names Form */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5">
                    <form onSubmit={handleSaveTasksSubmit} className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Edit3 className="w-4 h-4 text-indigo-600" />
                          <h5 className="text-xs sm:text-sm font-bold text-slate-800 font-heading">
                            กำหนดชื่องาน 2 ชิ้น - วิชา{selectedSubject === 'base' ? 'พื้นฐาน (ค21101)' : 'เพิ่มเติม (ค21201)'}
                          </h5>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          สามารถแก้ไขชื่องานได้ตามที่ต้องการ
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            ชื่องานชิ้นที่ 1:
                          </label>
                          <input
                            type="text"
                            value={taskForm.task1}
                            onChange={(e) => setTaskForm({ ...taskForm, task1: e.target.value })}
                            placeholder="เช่น งานชิ้นที่ 1: สมุดแบบฝึกหัด"
                            required
                            className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium transition focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            ชื่องานชิ้นที่ 2:
                          </label>
                          <input
                            type="text"
                            value={taskForm.task2}
                            onChange={(e) => setTaskForm({ ...taskForm, task2: e.target.value })}
                            placeholder="เช่น งานชิ้นที่ 2: ใบงานระบบจำนวนเต็ม"
                            required
                            className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium transition focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Preview Box */}
                      <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-500">ตัวอย่างหลังชื่อนักเรียน (ผ่าน / ไม่ผ่าน / ยังไม่ส่ง):</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                              <span>{taskForm.task1 || 'งานชิ้นที่ 1'}:</span>
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded text-[11px] border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                ผ่าน
                              </span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                              <span>{taskForm.task2 || 'งานชิ้นที่ 2'}:</span>
                              <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-white px-1.5 py-0.5 rounded text-[11px] border border-amber-300">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                ไม่ผ่าน
                              </span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                              <span>{taskForm.task2 || 'งานชิ้นที่ 2'}:</span>
                              <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-white px-1.5 py-0.5 rounded text-[11px] border border-rose-300">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                ยังไม่ส่ง
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleResetTasksSubmit}
                            className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-xl transition flex items-center gap-1 cursor-pointer"
                            title="คืนค่าชื่องานเริ่มต้น"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>คืนค่าเดิม</span>
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>บันทึกชื่องาน</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Submission Statistics Cards */}
                  {(() => {
                    const taskStatuses = currentStudents.map(s => getStudentTaskStatus(s, currentHeaders, currentSubmissions));
                    const countBothPassed = taskStatuses.filter(st => st.task1 === 'passed' && st.task2 === 'passed').length;
                    const countHasFailed = taskStatuses.filter(st => st.task1 === 'failed' || st.task2 === 'failed').length;
                    const countHasNotSubmitted = taskStatuses.filter(st => st.task1 === 'not_submitted' && st.task2 === 'not_submitted').length;

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                          <span className="text-[11px] font-medium text-slate-500 block">นักเรียนทั้งหมด</span>
                          <strong className="text-lg font-bold text-slate-800 font-mono">{currentStudents.length}</strong>
                          <span className="text-[11px] text-slate-400 ml-1">คน</span>
                        </div>
                        <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 shadow-2xs">
                          <span className="text-[11px] font-bold text-emerald-800 block">✓ ผ่านครบทั้ง 2 ชิ้น</span>
                          <strong className="text-lg font-bold text-emerald-700 font-mono">{countBothPassed}</strong>
                          <span className="text-[11px] text-emerald-600 ml-1">คน</span>
                        </div>
                        <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 shadow-2xs">
                          <span className="text-[11px] font-bold text-amber-800 block">⚠ มีงานไม่ผ่าน</span>
                          <strong className="text-lg font-bold text-amber-700 font-mono">{countHasFailed}</strong>
                          <span className="text-[11px] text-amber-600 ml-1">คน</span>
                        </div>
                        <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200 shadow-2xs">
                          <span className="text-[11px] font-bold text-rose-800 block">✕ ยังไม่ส่งทั้ง 2 ชิ้น</span>
                          <strong className="text-lg font-bold text-rose-700 font-mono">{countHasNotSubmitted}</strong>
                          <span className="text-[11px] text-rose-600 ml-1">คน</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Filter, Search, and Bulk Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                      {/* Room Filter Dropdown */}
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-xl px-3 py-2 min-h-[42px] transition">
                        <Filter className="w-4 h-4 text-indigo-600 shrink-0" />
                        <label className="text-xs font-bold text-slate-700 shrink-0">ห้อง:</label>
                        <select
                          value={selectedClassFilter}
                          onChange={(e) => setSelectedClassFilter(e.target.value)}
                          className="bg-transparent text-xs font-bold text-indigo-700 focus:outline-none cursor-pointer pr-2"
                        >
                          <option value="all">ทุกห้อง ({currentStudents.length} คน)</option>
                          {availableClasses.map((cls) => {
                            const countInClass = currentStudents.filter(s => s.class === cls).length;
                            return (
                              <option key={cls} value={cls}>ห้อง {cls} ({countInClass} คน)</option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Search Input */}
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={gradebookQuery}
                          onChange={(e) => setGradebookQuery(e.target.value)}
                          placeholder="ค้นหารหัส, ชื่อ-สกุล หรือเลขที่..."
                          className="w-full min-h-[42px] bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Bulk Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          onSetAllStudentTasks(selectedSubject, 'task1', 'passed');
                          triggerSavedFeedback(`บันทึกแล้ว: ทำเครื่องหมาย "ผ่าน" ครบทุกคน (${taskForm.task1})`);
                        }}
                        className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition flex items-center gap-1 cursor-pointer"
                        title="ทำเครื่องหมายผ่านทุกคนสำหรับงานชิ้นที่ 1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ผ่านทุกคน (งาน 1)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSetAllStudentTasks(selectedSubject, 'task2', 'passed');
                          triggerSavedFeedback(`บันทึกแล้ว: ทำเครื่องหมาย "ผ่าน" ครบทุกคน (${taskForm.task2})`);
                        }}
                        className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition flex items-center gap-1 cursor-pointer"
                        title="ทำเครื่องหมายผ่านทุกคนสำหรับงานชิ้นที่ 2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ผ่านทุกคน (งาน 2)</span>
                      </button>
                    </div>
                  </div>

                  {/* Students Table */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs max-h-[55vh]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100/90 text-slate-700 sticky top-0 z-20 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 text-center w-14 font-bold">เลขที่</th>
                          <th className="py-2.5 px-3 w-20 text-center font-bold">รหัส</th>
                          <th className="py-2.5 px-4 font-bold min-w-44">ชื่อ - สกุล</th>
                          <th className="py-2.5 px-2 text-center w-16 font-bold">ห้อง</th>
                          <th className="py-2.5 px-3 text-center min-w-56 font-bold border-l border-slate-200">
                            {taskForm.task1 || 'งานชิ้นที่ 1'}
                          </th>
                          <th className="py-2.5 px-3 text-center min-w-56 font-bold border-l border-slate-200">
                            {taskForm.task2 || 'งานชิ้นที่ 2'}
                          </th>
                          <th className="py-2.5 px-3 text-center w-32 font-bold border-l border-slate-200">
                            ภาพรวม
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudentsForGradebook.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                              ไม่พบข้อมูลนักเรียนที่ตรงกับตัวกรองห้องหรือคำค้นหา
                            </td>
                          </tr>
                        ) : (
                          filteredStudentsForGradebook.map((st) => {
                            const status = getStudentTaskStatus(st, currentHeaders, currentSubmissions);
                            return (
                              <tr key={st.id} className="hover:bg-indigo-50/30 transition">
                                <td className="py-2 px-3 text-center text-slate-500 font-mono font-medium">
                                  {st.no}
                                </td>
                                <td className="py-2 px-3 font-mono font-semibold text-slate-700 text-center">
                                  {st.id}
                                </td>
                                <td className="py-2 px-4 font-semibold text-slate-800 whitespace-nowrap">
                                  {st.name}
                                </td>
                                <td className="py-2 px-2 text-center text-slate-600 font-medium">
                                  {st.class || '-'}
                                </td>
                                
                                {/* Task 1 3-state Segmented Control */}
                                <td className="py-2 px-3 text-center border-l border-slate-100">
                                  <div className="inline-flex rounded-xl p-0.5 bg-slate-100 border border-slate-200/90 shadow-2xs">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onSetStudentTaskStatus(selectedSubject, st.id, 'task1', 'passed');
                                        triggerSavedFeedback('บันทึกแล้ว: ทำเครื่องหมาย "ผ่าน"');
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                        status.task1 === 'passed'
                                          ? 'bg-emerald-600 text-white shadow-2xs'
                                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                      }`}
                                      title="ผ่าน"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>ผ่าน</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onSetStudentTaskStatus(selectedSubject, st.id, 'task1', 'failed');
                                        triggerSavedFeedback('บันทึกแล้ว: ทำเครื่องหมาย "ไม่ผ่าน"');
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                        status.task1 === 'failed'
                                          ? 'bg-amber-500 text-white shadow-2xs'
                                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                      }`}
                                      title="ไม่ผ่าน"
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                      <span>ไม่ผ่าน</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onSetStudentTaskStatus(selectedSubject, st.id, 'task1', 'not_submitted');
                                        triggerSavedFeedback('บันทึกแล้ว: ทำเครื่องหมาย "ยังไม่ส่ง"');
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                        status.task1 === 'not_submitted'
                                          ? 'bg-rose-600 text-white shadow-2xs'
                                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                      }`}
                                      title="ยังไม่ส่ง"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                      <span>ยังไม่ส่ง</span>
                                    </button>
                                  </div>
                                </td>

                                {/* Task 2 3-state Segmented Control */}
                                <td className="py-2 px-3 text-center border-l border-slate-100">
                                  <div className="inline-flex rounded-xl p-0.5 bg-slate-100 border border-slate-200/90 shadow-2xs">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onSetStudentTaskStatus(selectedSubject, st.id, 'task2', 'passed');
                                        triggerSavedFeedback('บันทึกแล้ว: ทำเครื่องหมาย "ผ่าน"');
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                        status.task2 === 'passed'
                                          ? 'bg-emerald-600 text-white shadow-2xs'
                                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                      }`}
                                      title="ผ่าน"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>ผ่าน</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onSetStudentTaskStatus(selectedSubject, st.id, 'task2', 'failed');
                                        triggerSavedFeedback('บันทึกแล้ว: ทำเครื่องหมาย "ไม่ผ่าน"');
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                        status.task2 === 'failed'
                                          ? 'bg-amber-500 text-white shadow-2xs'
                                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                      }`}
                                      title="ไม่ผ่าน"
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                      <span>ไม่ผ่าน</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onSetStudentTaskStatus(selectedSubject, st.id, 'task2', 'not_submitted');
                                        triggerSavedFeedback('บันทึกแล้ว: ทำเครื่องหมาย "ยังไม่ส่ง"');
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                        status.task2 === 'not_submitted'
                                          ? 'bg-rose-600 text-white shadow-2xs'
                                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                      }`}
                                      title="ยังไม่ส่ง"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                      <span>ยังไม่ส่ง</span>
                                    </button>
                                  </div>
                                </td>

                                {/* Overall Badge */}
                                <td className="py-2 px-3 text-center border-l border-slate-100">
                                  {status.task1 === 'passed' && status.task2 === 'passed' ? (
                                    <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                      ผ่านครบ 2 ชิ้น
                                    </span>
                                  ) : (status.task1 === 'failed' || status.task2 === 'failed') ? (
                                    <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                                      มีงานไม่ผ่าน
                                    </span>
                                  ) : (status.task1 === 'not_submitted' && status.task2 === 'not_submitted') ? (
                                    <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                                      ยังไม่ส่ง
                                    </span>
                                  ) : (
                                    <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                                      ส่ง 1 / 2 ชิ้น
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: GRADE VISIBILITY SETTINGS */}
              {activeTab === 'display' && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-slate-800 font-heading">
                          จัดการการแสดงผลระดับผลการเรียน (เกรด)
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          ตั้งค่าเปิดหรือซ่อน "เกรด (0 - 4)" ไม่ให้นักเรียนเห็น โดยที่นักเรียนยังคงสามารถตรวจสอบคะแนนเก็บและสถานะการส่งงานได้ตามปกติ
                        </p>
                      </div>
                    </div>

                    {/* Quick Bulk Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl mb-6">
                      <div className="text-xs font-semibold text-slate-700">
                        การดำเนินการด่วนสำหรับทั้ง 2 วิชา:
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onSetGradeVisibility('base', true);
                            onSetGradeVisibility('extra', true);
                            triggerSavedFeedback('บันทึกแล้ว: เปิดแสดงเกรดทั้ง 2 วิชาเรียบร้อยแล้ว');
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>เปิดแสดงเกรดทั้งหมด</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSetGradeVisibility('base', false);
                            onSetGradeVisibility('extra', false);
                            triggerSavedFeedback('บันทึกแล้ว: ซ่อนเกรดทั้ง 2 วิชาเรียบร้อยแล้ว');
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-800 bg-white hover:bg-amber-50 border border-amber-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                          <span>ซ่อนเกรดทั้งหมด</span>
                        </button>
                      </div>
                    </div>

                    {/* 2 Subjects Grade Control Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* 1. Base Subject */}
                      <div className={`p-5 rounded-2xl border transition-all ${
                        gradeVisibility.base 
                          ? 'bg-emerald-50/40 border-emerald-200/90 shadow-2xs' 
                          : 'bg-amber-50/40 border-amber-200/90 shadow-2xs'
                      }`}>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">วิชาที่ 1</span>
                            <h5 className="text-base font-bold text-slate-900 font-heading">
                              คณิตศาสตร์พื้นฐาน (ค21101)
                            </h5>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            gradeVisibility.base
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {gradeVisibility.base ? (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                แสดงผลให้นักเรียน
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                                ซ่อนจากนักเรียน
                              </>
                            )}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                          {gradeVisibility.base
                            ? 'นักเรียนที่เข้ามาค้นหาจะสามารถดูเกรด (เช่น เกรด 4, 3.5, 3) ได้ในการ์ดสรุปผล'
                            : 'นักเรียนจะไม่เห็นการ์ดเกรด จะเห็นเฉพาะคะแนนรวมสะสม และสถานะ "ยังไม่เปิดเผยผลการเรียน"'}
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            onToggleGradeVisibility('base');
                            triggerSavedFeedback(`บันทึกแล้ว: ${gradeVisibility.base ? 'ซ่อน' : 'เปิดแสดง'}เกรดวิชาพื้นฐานเรียบร้อยแล้ว`);
                          }}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                            gradeVisibility.base
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {gradeVisibility.base ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              <span>คลิกเพื่อ ซ่อนเกรด วิชาพื้นฐาน</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              <span>คลิกเพื่อ เปิดแสดงเกรด วิชาพื้นฐาน</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* 2. Extra Subject */}
                      <div className={`p-5 rounded-2xl border transition-all ${
                        gradeVisibility.extra 
                          ? 'bg-emerald-50/40 border-emerald-200/90 shadow-2xs' 
                          : 'bg-amber-50/40 border-amber-200/90 shadow-2xs'
                      }`}>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">วิชาที่ 2</span>
                            <h5 className="text-base font-bold text-slate-900 font-heading">
                              คณิตศาสตร์เพิ่มเติม (ค21201)
                            </h5>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            gradeVisibility.extra
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {gradeVisibility.extra ? (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                แสดงผลให้นักเรียน
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                                ซ่อนจากนักเรียน
                              </>
                            )}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                          {gradeVisibility.extra
                            ? 'นักเรียนที่เข้ามาค้นหาจะสามารถดูเกรด (เช่น เกรด 4, 3.5, 3) ได้ในการ์ดสรุปผล'
                            : 'นักเรียนจะไม่เห็นการ์ดเกรด จะเห็นเฉพาะคะแนนรวมสะสม และสถานะ "ยังไม่เปิดเผยผลการเรียน"'}
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            onToggleGradeVisibility('extra');
                            triggerSavedFeedback(`บันทึกแล้ว: ${gradeVisibility.extra ? 'ซ่อน' : 'เปิดแสดง'}เกรดวิชาเพิ่มเติมเรียบร้อยแล้ว`);
                          }}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                            gradeVisibility.extra
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {gradeVisibility.extra ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              <span>คลิกเพื่อ ซ่อนเกรด วิชาเพิ่มเติม</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              <span>คลิกเพื่อ เปิดแสดงเกรด วิชาเพิ่มเติม</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>

                    {/* Explanatory banner */}
                    <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <strong className="text-slate-800 block">คำแนะนำสำหรับคุณครู:</strong>
                        <p>
                          ในช่วงระหว่างภาคเรียน หรือก่อนการอนุมัติผลการเรียน คุณครูสามารถกด <strong>"ซ่อนเกรด"</strong> ไว้ก่อน เพื่อให้นักเรียนเข้ามาเช็คคะแนนเก็บ คะแนนสอบย่อย และส่งงานที่ยังค้างให้เรียบร้อย โดยไม่เกิดความกังวลเรื่องเกรดเฉลี่ย
                        </p>
                        <p>
                          เมื่อตัดเกรดเสร็จสิ้นและพร้อมประกาศผล คุณครูเพียงคลิกปุ่ม <strong>"เปิดแสดงเกรด"</strong> ระบบจะแสดงระดับผลการเรียน (เกรด) ให้นักเรียนเห็นทันทีโดยไม่ต้องอัปโหลดไฟล์ใหม่
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: GRADEBOOK EDITOR */}
              {activeTab === 'gradebook' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-800 font-heading flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-indigo-600" />
                        สมุดบันทึกคะแนน (Gradebook Editor) - วิชา{selectedSubject === 'base' ? 'พื้นฐาน' : 'เพิ่มเติม'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        คุณครูสามารถคลิกแก้ไขคะแนนในแต่ละช่องได้โดยตรง เมื่อแก้ไขแล้วระบบจะบันทึกทันทีพร้อมแจ้ง "บันทึกแล้ว"
                      </p>
                    </div>
                  </div>

                  {/* Filter and Search Bar with Room Filter (ตัวกรองห้อง) */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                      {/* Room Filter Dropdown */}
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-xl px-3 py-2 min-h-[42px] transition">
                        <Filter className="w-4 h-4 text-indigo-600 shrink-0" />
                        <label className="text-xs font-bold text-slate-700 shrink-0">ตัวกรองห้อง:</label>
                        <select
                          value={selectedClassFilter}
                          onChange={(e) => setSelectedClassFilter(e.target.value)}
                          className="bg-transparent text-xs font-bold text-indigo-700 focus:outline-none cursor-pointer pr-2"
                        >
                          <option value="all">ทุกห้อง ({currentStudents.length} คน)</option>
                          {availableClasses.map((cls) => {
                            const countInClass = currentStudents.filter(s => s.class === cls).length;
                            return (
                              <option key={cls} value={cls}>ห้อง {cls} ({countInClass} คน)</option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Search Input */}
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={gradebookQuery}
                          onChange={(e) => setGradebookQuery(e.target.value)}
                          placeholder="ค้นหารหัส, ชื่อ-สกุล หรือเลขที่..."
                          className="w-full min-h-[42px] bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-500 px-1">
                      <span>แสดง <strong>{filteredStudentsForGradebook.length}</strong> จาก {currentStudents.length} คน</span>
                    </div>
                  </div>

                  {/* Horizontal Scrollable Table with Sticky Columns for Mobile */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs max-h-[55vh]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100/90 text-slate-700 sticky top-0 z-20 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 sticky left-0 bg-slate-100 z-30 w-16 text-center font-bold">รหัส</th>
                          <th className="py-2.5 px-3 sticky left-16 bg-slate-100 z-30 min-w-36 font-bold">ชื่อ - สกุล</th>
                          <th className="py-2.5 px-2 text-center w-14 font-bold">ห้อง</th>
                          <th className="py-2.5 px-2 text-center w-12 font-bold">เลขที่</th>
                          {currentHeaders.slice(4).map((h, hIdx) => (
                            <th key={hIdx} className="py-2.5 px-3 min-w-24 text-center font-semibold text-slate-700 border-l border-slate-200">
                              <span className="block line-clamp-1" title={h}>{h}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudentsForGradebook.length === 0 ? (
                          <tr>
                            <td colSpan={currentHeaders.length + 1} className="py-12 text-center text-slate-400 text-xs">
                              ไม่พบข้อมูลนักเรียนที่ตรงกับตัวกรองห้องหรือคำค้นหา
                            </td>
                          </tr>
                        ) : (
                          filteredStudentsForGradebook.map((st) => (
                            <tr key={st.id} className="hover:bg-indigo-50/40 transition">
                              <td className="py-2 px-3 sticky left-0 bg-white font-mono font-semibold text-slate-700 text-center border-r border-slate-200 z-10">
                                {st.id}
                              </td>
                              <td className="py-2 px-3 sticky left-16 bg-white font-medium text-slate-800 border-r border-slate-200 whitespace-nowrap z-10">
                                {st.name}
                              </td>
                              <td className="py-2 px-2 text-center text-slate-600 font-medium">
                                {st.class || '-'}
                              </td>
                              <td className="py-2 px-2 text-center text-slate-500 font-mono">
                                {st.no}
                              </td>
                              {currentHeaders.slice(4).map((h, hIdx) => {
                                const colIdx = hIdx + 4;
                                const val = st.scores[colIdx] || '';
                                return (
                                  <td key={colIdx} className="py-1 px-2 text-center border-l border-slate-100">
                                    <input
                                      type="text"
                                      defaultValue={val}
                                      onBlur={(e) => {
                                        const newVal = e.target.value.trim();
                                        if (newVal !== val) {
                                          onUpdateStudentScore(selectedSubject, st.id, colIdx, newVal);
                                          triggerSavedFeedback(`บันทึกแล้ว: บันทึกคะแนน ${st.name} (${h}): ${newVal}`);
                                        }
                                      }}
                                      className="w-16 min-h-[34px] text-center bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg px-1 py-1 font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* TAB 3: CUSTOMIZE COLUMN HEADERS */}
              {activeTab === 'headers' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 font-heading">
                        แก้ไขชื่อหัวข้อคะแนนและคะแนนเต็ม - วิชา{selectedSubject === 'base' ? 'พื้นฐาน' : 'เพิ่มเติม'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        เปลี่ยนข้อความที่แสดงให้นักเรียนและผู้ปกครองเห็นในแต่ละช่องประเมิน
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (confirm('ต้องการรีเซ็ตชื่อหัวข้อทั้งหมดกลับเป็นค่าเริ่มต้นจากไฟล์ CSV หรือไม่?')) {
                            onResetCustomHeaders(selectedSubject);
                            initEditingHeaders(selectedSubject);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                        คืนค่าเริ่มต้น
                      </button>

                      <button
                        onClick={handleSaveHeaders}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        บันทึกการแก้ไข
                      </button>
                    </div>
                  </div>

                  {/* List of Headers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
                    {currentHeaders.slice(4).map((origHeader, idx) => {
                      const colIndex = idx + 4;
                      const val = editingHeaders[colIndex] ?? origHeader;

                      return (
                        <div key={colIndex} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="font-semibold text-slate-500">คอลัมน์ที่ {idx + 1}</span>
                            <span className="font-mono text-[10px]">Index {colIndex}</span>
                          </div>
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => {
                              setEditingHeaders({
                                ...editingHeaders,
                                [colIndex]: e.target.value,
                              });
                            }}
                            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* TAB 4: IMPORT / EXPORT CSV */}
              {activeTab === 'csv' && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    <h4 className="text-sm font-bold text-slate-800 mb-2 font-heading">
                      📁 นำเข้าไฟล์ CSV ชุดใหม่ (Upload New Gradebook)
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">
                      อัปโหลดไฟล์คะแนนนักเรียนรายวิชา (ระบบจะบันทึกในเบราว์เซอร์อัตโนมัติและแสดงผลทันที)
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 p-4 rounded-xl transition text-center">
                        <UploadCloud className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                        <span className="block text-xs font-bold text-indigo-900 mb-1">
                          อัปเดตไฟล์ "วิชาพื้นฐาน"
                        </span>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={(e) => handleFileChange(e, 'base')}
                          className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                        />
                      </div>

                      <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 p-4 rounded-xl transition text-center">
                        <UploadCloud className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                        <span className="block text-xs font-bold text-indigo-900 mb-1">
                          อัปเดตไฟล์ "วิชาเพิ่มเติม"
                        </span>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={(e) => handleFileChange(e, 'extra')}
                          className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                        />
                      </div>

                    </div>
                  </div>

                  {/* Export & Reset Box */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 font-heading">
                        📥 ส่งออกข้อมูลคะแนน (Export CSV) & รีเซ็ต
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ดาวน์โหลดไฟล์คะแนนปัจจุบันเพื่อนำไปเปิดใน Microsoft Excel หรือ Google Sheets
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleDownloadCSV('base')}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        โหลด CSV วิชาพื้นฐาน
                      </button>

                      <button
                        onClick={() => handleDownloadCSV('extra')}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        โหลด CSV วิชาเพิ่มเติม
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('คุณต้องการรีเซ็ตข้อมูลคะแนนและชื่อหัวข้อทั้งหมดกลับเป็นชุดตัวอย่างตั้งต้นหรือไม่?')) {
                            onResetToDefaults();
                            alert('รีเซ็ตข้อมูลเรียบร้อยแล้ว!');
                          }
                        }}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        รีเซ็ตข้อมูลตัวอย่าง
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 5: SECURITY */}
              {activeTab === 'security' && (
                <div className="max-w-md mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                  <h4 className="text-base font-bold text-slate-800 mb-1 font-heading flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-indigo-600" />
                    เปลี่ยนรหัสผ่าน Admin
                  </h4>
                  <p className="text-xs text-slate-500 mb-5">
                    ตั้งรหัสผ่านใหม่เพื่อความปลอดภัยในการเข้าถึงระบบจัดการคะแนนของคุณครู
                  </p>

                  <form onSubmit={handleSavePasswordSubmit} className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        รหัสผ่านใหม่
                      </label>
                      <input
                        type="password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="กรอกรหัสผ่านใหม่..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        ยืนยันรหัสผ่านใหม่
                      </label>
                      <input
                        type="password"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="กรอกรหัสผ่านใหม่อีกครั้ง..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    {passErrorMsg && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{passErrorMsg}</span>
                      </div>
                    )}

                    {passSuccessMsg && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-1.5">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>{passSuccessMsg}</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer"
                      >
                        บันทึกรหัสผ่านใหม่
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
