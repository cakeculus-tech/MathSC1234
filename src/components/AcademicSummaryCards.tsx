import React from 'react';
import { Award, Target, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { SubjectSummary } from '../types';
import { calculateGradeFromScore } from '../utils/csvHelper';

interface AcademicSummaryCardsProps {
  summary: SubjectSummary;
  subjectTitle?: string;
  showGrade?: boolean;
  isAdminLoggedIn?: boolean;
  onToggleGradeVisibility?: () => void;
}

export const AcademicSummaryCards: React.FC<AcademicSummaryCardsProps> = ({
  summary,
  showGrade = true,
  isAdminLoggedIn = false,
  onToggleGradeVisibility,
}) => {
  const gradeInfo = calculateGradeFromScore(summary.percentage);
  const displayGrade = summary.officialGrade || summary.calculatedGrade || '-';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
      
      {/* 1. Total Score Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">คะแนนรวมสะสม</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
            {summary.earnedScore}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            / {summary.totalPossibleScore} คะแนน
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                summary.percentage >= 80
                  ? 'bg-emerald-500'
                  : summary.percentage >= 65
                  ? 'bg-indigo-600'
                  : summary.percentage >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, summary.percentage))}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
            <span>คิดเป็น</span>
            <span className="font-semibold text-slate-700">{summary.percentage}%</span>
          </div>
        </div>
      </div>

      {/* 2. Grade Card (ซ่อนหรือแสดงผลได้จากแอดมิน) */}
      {showGrade ? (
        /* เมื่อเปิดแสดงเกรด */
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">ระดับผลการเรียน (เกรด)</span>
              <div className="flex items-center gap-1.5">
                {isAdminLoggedIn && onToggleGradeVisibility && (
                  <button
                    type="button"
                    onClick={onToggleGradeVisibility}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
                    title="คลิกเพื่อซ่อนเกรดไม่ให้นักเรียนเห็น"
                  >
                    <EyeOff className="w-3 h-3 text-amber-600" />
                    <span>ซ่อนเกรด</span>
                  </button>
                )}
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 font-heading">
                เกรด {displayGrade}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md border ${gradeInfo.color}`}>
              <TrendingUp className="w-3 h-3" />
              {gradeInfo.label}
            </span>

            {isAdminLoggedIn && (
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                แสดงให้นักเรียนเห็น
              </span>
            )}
          </div>
        </div>
      ) : isAdminLoggedIn ? (
        /* เมื่อแอดมินเลือกซ่อน แต่แอดมินล็อกอินอยู่: แอดมินยังมองเห็นได้ พร้อมแถบแจ้งเตือนว่าซ่อนอยู่ */
        <div className="bg-amber-50/40 rounded-2xl p-5 border-2 border-dashed border-amber-300 shadow-2xs transition relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-amber-900">ระดับผลการเรียน (เกรด)</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                  <EyeOff className="w-3 h-3" />
                  ซ่อนจากนักเรียนอยู่
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <EyeOff className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-700 font-heading">
                เกรด {displayGrade}
              </span>
              <span className="text-xs text-amber-700 font-medium">
                (คุณครูเห็นได้คนเดียว)
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-amber-200/60">
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${gradeInfo.color}`}>
              {gradeInfo.label}
            </span>

            {onToggleGradeVisibility && (
              <button
                type="button"
                onClick={onToggleGradeVisibility}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer shadow-2xs"
                title="คลิกเพื่อเปิดแสดงเกรดให้นักเรียนเห็น"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>เปิดแสดงเกรด</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* เมื่อนักเรียนดู และแอดมินสั่งซ่อนผลการเรียน */
        <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ระดับผลการเรียน (เกรด)</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center">
              <EyeOff className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2.5">
            <span className="text-base sm:text-lg font-bold text-slate-600 font-heading block">
              ยังไม่เปิดเผยผลการเรียน
            </span>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              คุณครูปิดการแสดงผลเกรดชั่วคราว รอประกาศผลอย่างเป็นทางการ
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>นักเรียนสามารถตรวจสอบคะแนนเก็บและสถานะส่งงานได้ตามปกติ</span>
          </div>
        </div>
      )}

    </div>
  );
};
