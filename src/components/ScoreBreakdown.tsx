import React, { useMemo } from 'react';
import { 
  Folder, 
  FileCheck, 
  HelpCircle, 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileSignature,
  EyeOff
} from 'lucide-react';
import { ChapterGroup, ScoreItem, SubjectType } from '../types';

interface ScoreBreakdownProps {
  groups: ChapterGroup[];
  subjectType: SubjectType;
  subjectTitle: string;
  showGrade?: boolean;
  isAdminLoggedIn?: boolean;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({
  groups,
  subjectType,
  subjectTitle,
  showGrade = true,
  isAdminLoggedIn = false,
}) => {
  // If showGrade is false and user is not admin, filter out items with category 'grade'
  const filteredGroups = useMemo(() => {
    if (showGrade || isAdminLoggedIn) {
      return groups;
    }
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => item.category !== 'grade'),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, showGrade, isAdminLoggedIn]);

  if (filteredGroups.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
        <Folder className="w-10 h-10 mx-auto text-slate-300 mb-2" />
        <p className="text-sm font-medium text-slate-600">ไม่พบรายการคะแนนในวิชานี้</p>
      </div>
    );
  }

  const getCategoryBadge = (item: ScoreItem) => {
    switch (item.category) {
      case 'assignment':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            ภาระงาน
          </span>
        );
      case 'participation':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
            จิตพิสัย
          </span>
        );
      case 'exam':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
            สอบวัดผล
          </span>
        );
      case 'kpa':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
            KPA รวม
          </span>
        );
      case 'midterm':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
            กลางภาค
          </span>
        );
      case 'final':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
            ปลายภาค
          </span>
        );
      case 'total':
      case 'grade':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-300 shrink-0">
            ผลสัมฤทธิ์
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Chapter Cards List */}
      {filteredGroups.map((group) => {
        const isSummaryGroup = group.id === 'summary';
        const isMidtermOrFinal = group.id === 'midterm' || group.id === 'final';

        return (
          <div
            key={group.id}
            className={`rounded-2xl border transition-all ${
              isSummaryGroup
                ? 'bg-gradient-to-br from-indigo-50/90 via-slate-50 to-indigo-50/40 border-indigo-200 shadow-xs'
                : isMidtermOrFinal
                ? 'bg-white border-slate-200/90 shadow-2xs'
                : 'bg-white border-slate-200/90 shadow-2xs'
            } p-5 sm:p-6`}
          >
            {/* Chapter Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSummaryGroup
                      ? 'bg-indigo-600 text-white'
                      : isMidtermOrFinal
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {isSummaryGroup ? (
                    <Award className="w-4 h-4" />
                  ) : isMidtermOrFinal ? (
                    <FileSignature className="w-4 h-4" />
                  ) : (
                    <Folder className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 font-heading">
                    {group.title}
                  </h3>
                  {group.badge && (
                    <span className="text-[11px] text-slate-400 font-normal">
                      กลุ่มประเมิน: {group.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Subtotal Pill */}
              {group.subtotalPossible > 0 && (
                <div className="self-start sm:self-auto flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl text-xs">
                  <span className="text-slate-500 font-medium">รวมคะแนนส่วนนี้:</span>
                  <span className="font-bold text-indigo-700">
                    {group.subtotalEarned} / {group.subtotalPossible}
                  </span>
                </div>
              )}
            </div>

            {/* Score Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.items.map((item) => {
                const isHighlight =
                  item.category === 'kpa' ||
                  item.category === 'total' ||
                  item.category === 'grade' ||
                  item.category === 'midterm' ||
                  item.category === 'final';

                const hasValue = item.score !== '' && item.score !== undefined && item.score !== '-';
                const numeric = item.numericScore;
                const max = item.maxScore;

                let scoreColorClass = 'text-slate-900';
                if (isHighlight) scoreColorClass = 'text-indigo-700';

                // Evaluate score vs max
                const isFullScore = max !== null && numeric !== null && numeric >= max && max > 0;

                const isHiddenGradeForAdmin = item.category === 'grade' && !showGrade && isAdminLoggedIn;

                return (
                  <div
                    key={item.index}
                    className={`rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
                      isHighlight
                        ? 'bg-indigo-50/60 border-indigo-200/80 shadow-2xs'
                        : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <span
                        className={`text-xs font-semibold line-clamp-2 ${
                          isHighlight ? 'text-indigo-950' : 'text-slate-700'
                        }`}
                        title={item.displayTitle}
                      >
                        {item.displayTitle}
                      </span>
                      <div className="flex items-center gap-1">
                        {isHiddenGradeForAdmin && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-0.5">
                            <EyeOff className="w-2.5 h-2.5" />
                            ซ่อนอยู่
                          </span>
                        )}
                        {getCategoryBadge(item)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/40">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        {hasValue ? (
                          isFullScore ? (
                            <span className="text-emerald-600 flex items-center gap-1 font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              คะแนนเต็ม
                            </span>
                          ) : (
                            <span className="text-slate-500 flex items-center gap-1">
                              <FileCheck className="w-3 h-3 text-slate-400" />
                              บันทึกแล้ว
                            </span>
                          )
                        ) : (
                          <span className="text-amber-600 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-500" />
                            รอกรอกคะแนน
                          </span>
                        )}
                      </div>

                      {/* Display Score Value */}
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-base font-bold font-heading px-2 py-0.5 rounded-md bg-white border border-slate-200/80 shadow-2xs ${scoreColorClass}`}
                        >
                          {hasValue ? item.score : '-'}
                        </span>
                        {max !== null && (
                          <span className="text-xs text-slate-400 font-medium">
                            /{max}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        );
      })}

    </div>
  );
};
