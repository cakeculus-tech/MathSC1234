import React, { useState, useEffect } from 'react';
import { X, Check, FileText, Lock, Save, RotateCcw, AlertCircle, BookOpen, Layers, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { SubjectType, TaskDefinitions } from '../types';
import { DEFAULT_BASE_TASKS, DEFAULT_EXTRA_TASKS, SUBJECT_METAS } from '../data/defaultData';

interface EditTaskNamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSubject: SubjectType;
  baseTasks: TaskDefinitions;
  extraTasks: TaskDefinitions;
  onSaveTasks: (subject: SubjectType, tasks: TaskDefinitions) => void;
  isAdminLoggedIn: boolean;
  onAdminLogin: (password: string) => boolean;
}

export const EditTaskNamesModal: React.FC<EditTaskNamesModalProps> = ({
  isOpen,
  onClose,
  activeSubject: initialSubject,
  baseTasks,
  extraTasks,
  onSaveTasks,
  isAdminLoggedIn,
  onAdminLogin,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>(initialSubject);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [task1Name, setTask1Name] = useState('');
  const [task2Name, setTask2Name] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setSelectedSubject(initialSubject);
  }, [initialSubject, isOpen]);

  useEffect(() => {
    const currentTasks = selectedSubject === 'base' ? baseTasks : extraTasks;
    setTask1Name(currentTasks.task1);
    setTask2Name(currentTasks.task2);
    setSavedSuccess(false);
  }, [selectedSubject, baseTasks, extraTasks, isOpen]);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAdminLogin(passwordInput)) {
      setPasswordError('');
      setPasswordInput('');
    } else {
      setPasswordError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task1Name.trim() || !task2Name.trim()) return;

    onSaveTasks(selectedSubject, {
      task1: task1Name.trim(),
      task2: task2Name.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetDefaults = () => {
    const defaultTasks = selectedSubject === 'base' ? DEFAULT_BASE_TASKS : DEFAULT_EXTRA_TASKS;
    setTask1Name(defaultTasks.task1);
    setTask2Name(defaultTasks.task2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading">แก้ไขชื่องาน 2 ชิ้น</h3>
              <p className="text-xs text-slate-400">กำหนดชื่องานที่จะแสดงหลังชื่อนักเรียน</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {!isAdminLoggedIn ? (
            /* Password Auth Form */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-3">
                <Lock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">ระบบต้องการสิทธิ์คุณครู</p>
                  <p className="text-indigo-700/90 mt-0.5">
                    กรุณากรอกรหัสผ่านคุณครูเพื่อแก้ไขชื่องานที่แสดงในระบบ (รหัสเริ่มต้น: admin123)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  รหัสผ่านคุณครู (Admin Password):
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="กรอกรหัสผ่าน..."
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
                />
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer shadow-sm"
                >
                  ยืนยันรหัสผ่าน
                </button>
              </div>
            </form>
          ) : (
            /* Editing Form */
            <form onSubmit={handleSave} className="space-y-4">
              {/* Subject Switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setSelectedSubject('base')}
                  className={`flex-1 min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedSubject === 'base'
                      ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{SUBJECT_METAS.base.title}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSubject('extra')}
                  className={`flex-1 min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedSubject === 'extra'
                      ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{SUBJECT_METAS.extra.title}</span>
                </button>
              </div>

              {/* Task 1 Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่องานชิ้นที่ 1:
                </label>
                <input
                  type="text"
                  value={task1Name}
                  onChange={(e) => setTask1Name(e.target.value)}
                  placeholder="เช่น งานชิ้นที่ 1: สมุดแบบฝึกหัด"
                  required
                  className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium transition focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                />
              </div>

              {/* Task 2 Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่องานชิ้นที่ 2:
                </label>
                <input
                  type="text"
                  value={task2Name}
                  onChange={(e) => setTask2Name(e.target.value)}
                  placeholder="เช่น งานชิ้นที่ 2: ใบงานระบบจำนวนเต็ม"
                  required
                  className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium transition focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                />
              </div>

              {/* Preview Box */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">
                  ตัวอย่างการแสดงผลหลังชื่อนักเรียน (รองรับ 3 สถานะ: ผ่าน, ไม่ผ่าน, ยังไม่ส่ง):
                </span>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                    <span className="text-slate-600 font-semibold">{task1Name || 'งานชิ้นที่ 1'}:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded text-[11px] border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ผ่าน
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-medium">
                    <span className="text-slate-600 font-semibold">{task2Name || 'งานชิ้นที่ 2'}:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-white px-1.5 py-0.5 rounded text-[11px] border border-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      ไม่ผ่าน
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium">
                    <span className="text-slate-600 font-semibold">{task2Name || 'งานชิ้นที่ 2'}:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-white px-1.5 py-0.5 rounded text-[11px] border border-rose-300">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      ยังไม่ส่ง
                    </span>
                  </div>
                </div>
              </div>

              {savedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>บันทึกแล้ว: บันทึกชื่องานเรียบร้อยแล้ว</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  title="คืนค่าชื่องานเริ่มต้น"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>คืนค่าเดิม</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    ปิด
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>บันทึกชื่องาน</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
