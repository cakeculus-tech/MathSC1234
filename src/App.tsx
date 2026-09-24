import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen } from 'lucide-react';

import { SchoolInfo, Student, SubjectType, TaskDefinitions, StudentTaskStatus, TaskItemStatus } from './types';
import { 
  DEFAULT_BASE_CSV, 
  DEFAULT_EXTRA_CSV, 
  DEFAULT_SCHOOL_INFO, 
  SUBJECT_METAS,
  DEFAULT_BASE_TASKS,
  DEFAULT_EXTRA_TASKS
} from './data/defaultData';
import { 
  parseCSV, 
  groupStudentScores, 
  calculateSubjectSummary, 
  computeClassStatistics,
  getStudentTaskStatus
} from './utils/csvHelper';

import { Navbar } from './components/Navbar';
import { SearchSection } from './components/SearchSection';
import { StudentProfileHeader } from './components/StudentProfileHeader';
import { AcademicSummaryCards } from './components/AcademicSummaryCards';
import { ScoreBreakdown } from './components/ScoreBreakdown';
import { AdminModal } from './components/AdminModal';
import { EditTaskNamesModal } from './components/EditTaskNamesModal';

export default function App() {
  // Persistence state
  const [baseCSV, setBaseCSV] = useState<string>(() => {
    return localStorage.getItem('csv_data_base') || DEFAULT_BASE_CSV;
  });

  const [extraCSV, setExtraCSV] = useState<string>(() => {
    return localStorage.getItem('csv_data_extra') || DEFAULT_EXTRA_CSV;
  });

  const [customBaseHeaders, setCustomBaseHeaders] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem('custom_headers_base');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    return {};
  });

  const [customExtraHeaders, setCustomExtraHeaders] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem('custom_headers_extra');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    return {};
  });

  // Custom Learning Unit Titles state
  const [customBaseUnitTitles, setCustomBaseUnitTitles] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('custom_unit_titles_base');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    return {};
  });

  const [customExtraUnitTitles, setCustomExtraUnitTitles] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('custom_unit_titles_extra');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    return {};
  });

  // 2 Milestone Tasks state (งาน 2 ชิ้นว่าส่งหรือไม่ส่ง)
  const [baseTasks, setBaseTasks] = useState<TaskDefinitions>(() => {
    const saved = localStorage.getItem('task_names_base');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return DEFAULT_BASE_TASKS; }
    }
    return DEFAULT_BASE_TASKS;
  });

  const [extraTasks, setExtraTasks] = useState<TaskDefinitions>(() => {
    const saved = localStorage.getItem('task_names_extra');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return DEFAULT_EXTRA_TASKS; }
    }
    return DEFAULT_EXTRA_TASKS;
  });

  const [baseSubmissions, setBaseSubmissions] = useState<Record<string, StudentTaskStatus>>(() => {
    const saved = localStorage.getItem('task_submissions_base');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    return {};
  });

  const [extraSubmissions, setExtraSubmissions] = useState<Record<string, StudentTaskStatus>>(() => {
    const saved = localStorage.getItem('task_submissions_extra');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    return {};
  });

  const [isEditTasksModalOpen, setIsEditTasksModalOpen] = useState(false);

  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('admin_custom_password') || 'admin123';
  });

  // Grade Visibility state (ซ่อนหรือแสดงเกรด)
  const [gradeVisibility, setGradeVisibility] = useState<Record<SubjectType, boolean>>(() => {
    const saved = localStorage.getItem('grade_visibility');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return { base: true, extra: true }; }
    }
    return { base: true, extra: true };
  });

  const handleToggleGradeVisibility = (subject: SubjectType) => {
    setGradeVisibility(prev => {
      const updated = { ...prev, [subject]: !prev[subject] };
      localStorage.setItem('grade_visibility', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSetGradeVisibility = (subject: SubjectType, visible: boolean) => {
    setGradeVisibility(prev => {
      const updated = { ...prev, [subject]: visible };
      localStorage.setItem('grade_visibility', JSON.stringify(updated));
      return updated;
    });
  };

  // School and Teacher information state
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => {
    const saved = localStorage.getItem('school_info');
    if (saved) {
      try {
        return { ...DEFAULT_SCHOOL_INFO, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_SCHOOL_INFO;
      }
    }
    return DEFAULT_SCHOOL_INFO;
  });

  const handleSaveSchoolInfo = (info: SchoolInfo) => {
    setSchoolInfo(info);
    localStorage.setItem('school_info', JSON.stringify(info));
  };

  // UI State
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<SubjectType>('base');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Parse CSVs into structured objects
  const baseData = useMemo(() => parseCSV(baseCSV), [baseCSV]);
  const extraData = useMemo(() => parseCSV(extraCSV), [extraCSV]);

  // Compute Class Analytics
  const baseStats = useMemo(() => computeClassStatistics(baseData.students, baseData.headers), [baseData]);
  const extraStats = useMemo(() => computeClassStatistics(extraData.students, extraData.headers), [extraData]);

  // Selected Student in current active subject dataset
  const currentActiveData = activeSubject === 'base' ? baseData : extraData;
  const currentActiveHeaders = currentActiveData.headers;
  const currentActiveCustomHeaders = activeSubject === 'base' ? customBaseHeaders : customExtraHeaders;
  const currentActiveCustomUnitTitles = activeSubject === 'base' ? customBaseUnitTitles : customExtraUnitTitles;

  const currentStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return currentActiveData.students.find(s => s.id === selectedStudentId) || null;
  }, [selectedStudentId, currentActiveData]);

  // 2 Tasks definition & submission status for active subject & student
  const currentActiveTasks = activeSubject === 'base' ? baseTasks : extraTasks;
  const currentActiveSubmissions = activeSubject === 'base' ? baseSubmissions : extraSubmissions;

  const currentStudentTaskStatus: StudentTaskStatus = useMemo(() => {
    if (!currentStudent) return { task1: 'not_submitted', task2: 'not_submitted' };
    return getStudentTaskStatus(currentStudent, currentActiveHeaders, currentActiveSubmissions);
  }, [currentStudent, currentActiveHeaders, currentActiveSubmissions]);

  // Grouped score items for active student
  const groupedScores = useMemo(() => {
    if (!currentStudent) return [];
    return groupStudentScores(
      currentStudent, 
      currentActiveHeaders, 
      currentActiveCustomHeaders,
      currentActiveCustomUnitTitles
    );
  }, [currentStudent, currentActiveHeaders, currentActiveCustomHeaders, currentActiveCustomUnitTitles]);

  // Summary statistics for active student
  const subjectSummary = useMemo(() => {
    if (!currentStudent) return null;
    return calculateSubjectSummary(currentStudent, currentActiveHeaders);
  }, [currentStudent, currentActiveHeaders]);

  // Handlers
  const handleSelectStudent = (student: Student) => {
    setSelectedStudentId(student.id);
  };

  const handleResetSearch = () => {
    setSelectedStudentId(null);
  };

  const handleSwitchSubject = (subject: SubjectType) => {
    setActiveSubject(subject);
  };

  const handleAdminLogin = (password: string) => {
    if (password === adminPassword) {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
  };

  const handleChangePassword = (newPass: string) => {
    setAdminPassword(newPass);
    localStorage.setItem('admin_custom_password', newPass);
  };

  const handleSaveCustomHeaders = (subject: SubjectType, headers: Record<number, string>) => {
    if (subject === 'base') {
      setCustomBaseHeaders(headers);
      localStorage.setItem('custom_headers_base', JSON.stringify(headers));
    } else {
      setCustomExtraHeaders(headers);
      localStorage.setItem('custom_headers_extra', JSON.stringify(headers));
    }
  };

  const handleResetCustomHeaders = (subject: SubjectType) => {
    if (subject === 'base') {
      setCustomBaseHeaders({});
      localStorage.removeItem('custom_headers_base');
    } else {
      setCustomExtraHeaders({});
      localStorage.removeItem('custom_headers_extra');
    }
  };

  const handleSaveCustomUnitTitles = (subject: SubjectType, unitTitles: Record<string, string>) => {
    if (subject === 'base') {
      setCustomBaseUnitTitles(unitTitles);
      localStorage.setItem('custom_unit_titles_base', JSON.stringify(unitTitles));
    } else {
      setCustomExtraUnitTitles(unitTitles);
      localStorage.setItem('custom_unit_titles_extra', JSON.stringify(unitTitles));
    }
  };

  const handleResetCustomUnitTitles = (subject: SubjectType) => {
    if (subject === 'base') {
      setCustomBaseUnitTitles({});
      localStorage.removeItem('custom_unit_titles_base');
    } else {
      setCustomExtraUnitTitles({});
      localStorage.removeItem('custom_unit_titles_extra');
    }
  };

  const handleSaveTasks = (subject: SubjectType, tasks: TaskDefinitions) => {
    if (subject === 'base') {
      setBaseTasks(tasks);
      localStorage.setItem('task_names_base', JSON.stringify(tasks));
    } else {
      setExtraTasks(tasks);
      localStorage.setItem('task_names_extra', JSON.stringify(tasks));
    }
  };

  const handleToggleStudentTask = (subject: SubjectType, studentId: string, taskKey: 'task1' | 'task2') => {
    const students = subject === 'base' ? baseData.students : extraData.students;
    const headers = subject === 'base' ? baseData.headers : extraData.headers;
    const currentSubs = subject === 'base' ? baseSubmissions : extraSubmissions;
    const targetStudent = students.find(s => s.id === studentId);
    if (!targetStudent) return;

    const currentStatus = getStudentTaskStatus(targetStudent, headers, currentSubs);
    const curr = currentStatus[taskKey];
    let next: TaskItemStatus = 'passed';
    if (curr === 'passed') next = 'failed';
    else if (curr === 'failed') next = 'not_submitted';
    else next = 'passed';

    const newStatus: StudentTaskStatus = {
      ...currentStatus,
      [taskKey]: next,
    };

    if (subject === 'base') {
      const updated = { ...baseSubmissions, [studentId]: newStatus };
      setBaseSubmissions(updated);
      localStorage.setItem('task_submissions_base', JSON.stringify(updated));
    } else {
      const updated = { ...extraSubmissions, [studentId]: newStatus };
      setExtraSubmissions(updated);
      localStorage.setItem('task_submissions_extra', JSON.stringify(updated));
    }
  };

  const handleSetStudentTaskStatus = (
    subject: SubjectType,
    studentId: string,
    taskKey: 'task1' | 'task2',
    status: TaskItemStatus
  ) => {
    const students = subject === 'base' ? baseData.students : extraData.students;
    const headers = subject === 'base' ? baseData.headers : extraData.headers;
    const currentSubs = subject === 'base' ? baseSubmissions : extraSubmissions;
    const targetStudent = students.find(s => s.id === studentId);
    if (!targetStudent) return;

    const currentStatus = getStudentTaskStatus(targetStudent, headers, currentSubs);
    const updatedStatus: StudentTaskStatus = {
      ...currentStatus,
      [taskKey]: status,
    };

    if (subject === 'base') {
      const updated = { ...baseSubmissions, [studentId]: updatedStatus };
      setBaseSubmissions(updated);
      localStorage.setItem('task_submissions_base', JSON.stringify(updated));
    } else {
      const updated = { ...extraSubmissions, [studentId]: updatedStatus };
      setExtraSubmissions(updated);
      localStorage.setItem('task_submissions_extra', JSON.stringify(updated));
    }
  };

  const handleSetAllStudentTasks = (subject: SubjectType, taskKey: 'task1' | 'task2', status: TaskItemStatus) => {
    const students = subject === 'base' ? baseData.students : extraData.students;
    const headers = subject === 'base' ? baseData.headers : extraData.headers;
    const currentSubs = subject === 'base' ? baseSubmissions : extraSubmissions;

    const updated: Record<string, StudentTaskStatus> = { ...currentSubs };
    students.forEach((s) => {
      const prev = getStudentTaskStatus(s, headers, currentSubs);
      updated[s.id] = {
        ...prev,
        [taskKey]: status,
      };
    });

    if (subject === 'base') {
      setBaseSubmissions(updated);
      localStorage.setItem('task_submissions_base', JSON.stringify(updated));
    } else {
      setExtraSubmissions(updated);
      localStorage.setItem('task_submissions_extra', JSON.stringify(updated));
    }
  };

  const handleUploadCSV = (subject: SubjectType, csvText: string) => {
    if (subject === 'base') {
      setBaseCSV(csvText);
      localStorage.setItem('csv_data_base', csvText);
    } else {
      setExtraCSV(csvText);
      localStorage.setItem('csv_data_extra', csvText);
    }
  };

  const handleResetToDefaults = () => {
    localStorage.removeItem('csv_data_base');
    localStorage.removeItem('csv_data_extra');
    localStorage.removeItem('custom_headers_base');
    localStorage.removeItem('custom_headers_extra');
    localStorage.removeItem('custom_unit_titles_base');
    localStorage.removeItem('custom_unit_titles_extra');
    localStorage.removeItem('task_names_base');
    localStorage.removeItem('task_names_extra');
    localStorage.removeItem('task_submissions_base');
    localStorage.removeItem('task_submissions_extra');
    setBaseCSV(DEFAULT_BASE_CSV);
    setExtraCSV(DEFAULT_EXTRA_CSV);
    setCustomBaseHeaders({});
    setCustomExtraHeaders({});
    setCustomBaseUnitTitles({});
    setCustomExtraUnitTitles({});
    setBaseTasks(DEFAULT_BASE_TASKS);
    setExtraTasks(DEFAULT_EXTRA_TASKS);
    setBaseSubmissions({});
    setExtraSubmissions({});
  };

  // Gradebook individual score edit handler
  const handleUpdateStudentScore = (
    subject: SubjectType,
    studentId: string,
    colIndex: number,
    newScore: string
  ) => {
    const targetCSV = subject === 'base' ? baseCSV : extraCSV;
    const parsed = parseCSV(targetCSV);
    
    // Find row index by studentId
    const updatedRows = parsed.rows.map((row) => {
      if (row[0] === studentId) {
        const copy = [...row];
        while (copy.length <= colIndex) {
          copy.push('');
        }
        copy[colIndex] = newScore;
        return copy;
      }
      return row;
    });

    const headers = parsed.headers;
    const formatCell = (val: string) => (val.includes(',') ? `"${val}"` : val);
    const newCSVString = `${headers.map(formatCell).join(',')}\n${updatedRows.map(r => r.map(formatCell).join(',')).join('\n')}`;

    if (subject === 'base') {
      setBaseCSV(newCSVString);
      localStorage.setItem('csv_data_base', newCSVString);
    } else {
      setExtraCSV(newCSVString);
      localStorage.setItem('csv_data_extra', newCSVString);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-800 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        schoolInfo={schoolInfo}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogoutAdmin={handleAdminLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-9 space-y-6 sm:space-y-8">
        
        {/* Search Bar Section */}
        <SearchSection
          students={baseData.students}
          onSelectStudent={handleSelectStudent}
          selectedStudent={currentStudent}
          onReset={handleResetSearch}
        />

        {/* Dynamic State Display */}
        <AnimatePresence mode="wait">
          {currentStudent && subjectSummary ? (
            /* Student Selected State */
            <motion.div
              key={currentStudent.id + activeSubject}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Student Identification & 2 Tasks Status Header */}
              <StudentProfileHeader
                student={currentStudent}
                activeSubject={activeSubject}
                onSwitchSubject={handleSwitchSubject}
                onResetSearch={handleResetSearch}
                taskDefinitions={currentActiveTasks}
                taskStatus={currentStudentTaskStatus}
                isAdminLoggedIn={isAdminLoggedIn}
                onToggleTask={(taskKey) => currentStudent && handleToggleStudentTask(activeSubject, currentStudent.id, taskKey)}
                onEditTaskNames={() => setIsEditTasksModalOpen(true)}
              />

              {/* KPI Performance Metric Cards */}
              <AcademicSummaryCards
                summary={subjectSummary}
                subjectTitle={SUBJECT_METAS[activeSubject].title}
                showGrade={gradeVisibility[activeSubject]}
                isAdminLoggedIn={isAdminLoggedIn}
                onToggleGradeVisibility={() => handleToggleGradeVisibility(activeSubject)}
              />

              {/* Chapter-by-Chapter Score Breakdown */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 font-heading">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      <span>รายละเอียดคะแนนเก็บและผลการสอบ</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      แสดงรายการประเมินตามตัวชี้วัด คะแนนเต็ม คะแนนที่ได้ และการประเมิน KPA
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs px-3 py-1.5 rounded-xl font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                      {SUBJECT_METAS[activeSubject].code} {SUBJECT_METAS[activeSubject].title}
                    </span>
                  </div>
                </div>

                <ScoreBreakdown
                  groups={groupedScores}
                  subjectType={activeSubject}
                  subjectTitle={SUBJECT_METAS[activeSubject].title}
                  showGrade={gradeVisibility[activeSubject]}
                  isAdminLoggedIn={isAdminLoggedIn}
                />
              </div>

            </motion.div>
          ) : null}
        </AnimatePresence>

      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © {new Date().getFullYear()} {schoolInfo.schoolName} • {schoolInfo.department}
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <span>เกณฑ์การวัดผลตามหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน</span>
            <span>•</span>
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              เมนูคุณครู
            </button>
          </div>
        </div>
      </footer>

      {/* Admin / Teacher Hub Modal */}
      {isAdminModalOpen && (
        <AdminModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          isAdminLoggedIn={isAdminLoggedIn}
          onLogin={handleAdminLogin}
          baseStudents={baseData.students}
          extraStudents={extraData.students}
          baseHeaders={baseData.headers}
          extraHeaders={extraData.headers}
          customBaseHeaders={customBaseHeaders}
          customExtraHeaders={customExtraHeaders}
          onSaveCustomHeaders={handleSaveCustomHeaders}
          onResetCustomHeaders={handleResetCustomHeaders}
          customBaseUnitTitles={customBaseUnitTitles}
          customExtraUnitTitles={customExtraUnitTitles}
          onSaveCustomUnitTitles={handleSaveCustomUnitTitles}
          onResetCustomUnitTitles={handleResetCustomUnitTitles}
          baseTasks={baseTasks}
          extraTasks={extraTasks}
          onSaveTasks={handleSaveTasks}
          baseSubmissions={baseSubmissions}
          extraSubmissions={extraSubmissions}
          onToggleStudentTask={handleToggleStudentTask}
          onSetStudentTaskStatus={handleSetStudentTaskStatus}
          onSetAllStudentTasks={handleSetAllStudentTasks}
          onUploadCSV={handleUploadCSV}
          onResetToDefaults={handleResetToDefaults}
          baseStats={baseStats}
          extraStats={extraStats}
          onChangePassword={handleChangePassword}
          onUpdateStudentScore={handleUpdateStudentScore}
          schoolInfo={schoolInfo}
          onSaveSchoolInfo={handleSaveSchoolInfo}
          gradeVisibility={gradeVisibility}
          onToggleGradeVisibility={handleToggleGradeVisibility}
          onSetGradeVisibility={handleSetGradeVisibility}
        />
      )}

      {/* Quick Edit Task Names Modal */}
      {isEditTasksModalOpen && (
        <EditTaskNamesModal
          isOpen={isEditTasksModalOpen}
          onClose={() => setIsEditTasksModalOpen(false)}
          activeSubject={activeSubject}
          baseTasks={baseTasks}
          extraTasks={extraTasks}
          onSaveTasks={handleSaveTasks}
          isAdminLoggedIn={isAdminLoggedIn}
          onAdminLogin={handleAdminLogin}
        />
      )}

    </div>
  );
}
