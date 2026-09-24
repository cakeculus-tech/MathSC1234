import React from 'react';
import { User, BookOpen, Layers, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Edit3 } from 'lucide-react';
import { Student, SubjectType, StudentTaskStatus, TaskDefinitions, TaskItemStatus } from '../types';
import { SUBJECT_METAS } from '../data/defaultData';

interface StudentProfileHeaderProps {
  student: Student;
  activeSubject: SubjectType;
  onSwitchSubject: (subject: SubjectType) => void;
  onResetSearch: () => void;
  taskDefinitions: TaskDefinitions;
  taskStatus: StudentTaskStatus;
  isAdminLoggedIn?: boolean;
  onToggleTask?: (taskKey: 'task1' | 'task2') => void;
  onEditTaskNames: () => void;
}

export const StudentProfileHeader: React.FC<StudentProfileHeaderProps> = ({
  student,
  activeSubject,
  onSwitchSubject,
  onResetSearch,
  taskDefinitions,
  taskStatus,
  isAdminLoggedIn,
  onToggleTask,
  onEditTaskNames,
}) => {
  // Generate student initials
  const initials = student.name
    .replace(/(เด็กชาย|เด็กหญิง|นาย|นางสาว)/g, '')
    .trim()
    .slice(0, 2);

  const renderStatusBadge = (status: TaskItemStatus) => {
    switch (status) {
      case 'passed':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-300 text-[11px] shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ผ่าน
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-white px-2 py-0.5 rounded-lg border border-amber-300 text-[11px] shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            ไม่ผ่าน
          </span>
        );
      case 'not_submitted':
      default:
        return (
          <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-white px-2 py-0.5 rounded-lg border border-rose-300 text-[11px] shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            ยังไม่ส่ง
          </span>
        );
    }
  };

  const getBadgeWrapperClass = (status: TaskItemStatus) => {
    switch (status) {
      case 'passed':
        return 'bg-emerald-50/90 border-emerald-200 text-emerald-800';
      case 'failed':
        return 'bg-amber-50/90 border-amber-200 text-amber-800';
      case 'not_submitted':
      default:
        return 'bg-rose-50/90 border-rose-200 text-rose-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
        
        {/* Student Identification Info */}
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
          <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-base sm:text-xl shadow-md ring-4 ring-indigo-50 shrink-0 font-heading">
            {initials || <User className="w-6 h-6 sm:w-7 sm:h-7" />}
          </div>

          <div className="min-w-0 flex-1">
            {/* Student Name & 2 Assignment Status Boxes (ช่องแสดง งาน 2 ชิ้น: ผ่าน / ไม่ผ่าน / ยังไม่ส่ง) */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
              <h2 className="text-base sm:text-xl font-bold text-slate-800 tracking-tight font-heading">
                {student.name}
              </h2>

              {/* ช่องแสดง งาน 2 ชิ้น */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Task 1 Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border font-medium transition select-none ${getBadgeWrapperClass(
                    taskStatus.task1
                  )} ${isAdminLoggedIn ? 'cursor-pointer hover:shadow-xs hover:scale-[1.02]' : ''}`}
                  onClick={() => isAdminLoggedIn && onToggleTask && onToggleTask('task1')}
                  title={isAdminLoggedIn ? 'คุณครูคลิกเพื่อสลับ: ผ่าน / ไม่ผ่าน / ยังไม่ส่ง' : undefined}
                >
                  <span className="text-slate-600 font-semibold">{taskDefinitions.task1}:</span>
                  {renderStatusBadge(taskStatus.task1)}
                </div>

                {/* Task 2 Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border font-medium transition select-none ${getBadgeWrapperClass(
                    taskStatus.task2
                  )} ${isAdminLoggedIn ? 'cursor-pointer hover:shadow-xs hover:scale-[1.02]' : ''}`}
                  onClick={() => isAdminLoggedIn && onToggleTask && onToggleTask('task2')}
                  title={isAdminLoggedIn ? 'คุณครูคลิกเพื่อสลับ: ผ่าน / ไม่ผ่าน / ยังไม่ส่ง' : undefined}
                >
                  <span className="text-slate-600 font-semibold">{taskDefinitions.task2}:</span>
                  {renderStatusBadge(taskStatus.task2)}
                </div>

                {/* Edit Task Names Button (สามารถแก้ไขชื่องานได้) */}
                <button
                  type="button"
                  onClick={onEditTaskNames}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100/90 border border-indigo-200/90 transition cursor-pointer shadow-2xs"
                  title="แก้ไขชื่องาน 2 ชิ้น"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>แก้ไขชื่องาน</span>
                </button>
              </div>
            </div>

            {/* Student Meta Details */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                รหัส: <strong className="text-slate-800 font-mono text-xs sm:text-sm">{student.id}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span>ห้อง: <strong className="text-slate-700">{student.class}</strong></span>
              <span className="text-slate-300">•</span>
              <span>เลขที่: <strong className="text-slate-700">{student.no}</strong></span>
              {isAdminLoggedIn && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    💡 คลิกที่ป้ายงานเพื่อสลับ ผ่าน / ไม่ผ่าน / ยังไม่ส่ง ได้ทันที
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls & Subject Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
          
          {/* Subject Switcher Tabs */}
          <div className="bg-slate-100/90 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80">
            <button
              onClick={() => onSwitchSubject('base')}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubject === 'base'
                  ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>{SUBJECT_METAS.base.code} พื้นฐาน</span>
            </button>

            <button
              onClick={() => onSwitchSubject('extra')}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubject === 'extra'
                  ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>{SUBJECT_METAS.extra.code} เพิ่มเติม</span>
            </button>
          </div>

          {/* Reset Search / Check Another Student */}
          <button
            onClick={onResetSearch}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            title="ค้นหานักเรียนคนอื่น"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>ค้นหาคนอื่น</span>
          </button>

        </div>

      </div>
    </div>
  );
};
