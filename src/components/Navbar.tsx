import React from 'react';
import { GraduationCap, ShieldCheck, Calendar, BookOpen, UserCheck, User } from 'lucide-react';
import { SchoolInfo } from '../types';

interface NavbarProps {
  schoolInfo: SchoolInfo;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  schoolInfo,
  onOpenAdmin,
  isAdminLoggedIn,
  onLogoutAdmin,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & School Title */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 pr-2">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-inner ring-2 ring-indigo-400/30 shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-heading truncate">
                  ระบบตรวจสอบผลการเรียน
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  ออนไลน์ 24 ชม.
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-normal truncate">
                {schoolInfo.schoolName} {schoolInfo.teacherName ? `• ${schoolInfo.teacherName}` : ''}
              </p>
            </div>
          </div>

          {/* Academic Term Info & Admin Action */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden lg:flex items-center gap-3 text-xs bg-slate-800/80 border border-slate-700/60 rounded-xl px-3.5 py-1.5 text-slate-300">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>ภาคเรียนที่ {schoolInfo.semester}/{schoolInfo.academicYear}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>{schoolInfo.className}</span>
              </div>
            </div>

            {isAdminLoggedIn ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={onOpenAdmin}
                  className="min-h-[40px] bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 sm:px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm ring-1 ring-indigo-400/40 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-200" />
                  <span className="hidden sm:inline">จัดการระบบ (Admin)</span>
                  <span className="sm:hidden">จัดการ</span>
                </button>
                <button
                  onClick={onLogoutAdmin}
                  className="min-h-[40px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs px-2.5 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
                  title="ออกจากระบบแอดมิน"
                >
                  ออก
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdmin}
                className="min-h-[40px] bg-slate-800/90 hover:bg-slate-700 active:bg-slate-600 text-slate-200 hover:text-white text-xs font-medium px-3 sm:px-3.5 py-2 rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">เข้าสู่ระบบคุณครู</span>
                <span className="sm:hidden">คุณครู</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
