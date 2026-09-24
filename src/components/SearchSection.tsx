import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Users, ChevronRight } from 'lucide-react';
import { Student } from '../types';

interface SearchSectionProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  selectedStudent: Student | null;
  onReset: () => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  students,
  onSelectStudent,
  selectedStudent,
  onReset,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLFormElement>(null);

  // Filter students based on query
  const filteredStudents = query.trim()
    ? students.filter(s => 
        s.id.toLowerCase().includes(query.trim().toLowerCase()) ||
        s.name.toLowerCase().includes(query.trim().toLowerCase()) ||
        s.no.includes(query.trim())
      ).slice(0, 6)
    : [];

  const handleSelect = (student: Student) => {
    onSelectStudent(student);
    setQuery(`${student.id} - ${student.name}`);
    setIsFocused(false);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const trimmed = query.trim().toLowerCase();
    const found = students.find(s => 
      s.id.toLowerCase() === trimmed ||
      s.name.toLowerCase().includes(trimmed) ||
      s.id.includes(trimmed)
    );

    if (found) {
      handleSelect(found);
    } else {
      // Trigger search even if not exact match (first matching)
      if (filteredStudents.length > 0) {
        handleSelect(filteredStudents[0]);
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    onReset();
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-20">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-4 sm:p-7 transition-all">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 sm:mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 font-heading">
              <Search className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>ค้นหาผลการเรียนนักเรียน</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              พิมพ์รหัสนักเรียน 5 หลัก (เช่น 54008) หรือพิมพ์ชื่อ-นามสกุล เพื่อดูผลการเรียน
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl self-start sm:self-auto shrink-0">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>นักเรียนทั้งหมดในระบบ: <strong>{students.length}</strong> คน</span>
          </div>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleManualSearch} className="relative" ref={dropdownRef}>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsFocused(true);
                }}
                onFocus={() => setIsFocused(true)}
                placeholder="กรอกรหัสนักเรียน 5 หลัก เช่น 54008 หรือชื่อนักเรียน..."
                className="w-full min-h-[46px] bg-slate-50/90 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-3 focus:ring-indigo-500/15 transition shadow-2xs"
              />

              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition min-w-[40px] justify-center cursor-pointer"
                  title="ล้างข้อมูล"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 sm:flex-initial min-h-[46px] bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>ค้นหาข้อมูล</span>
              </button>

              {selectedStudent && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="min-h-[46px] px-4 py-3 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 transition cursor-pointer flex items-center justify-center"
                >
                  ล้างการค้นหา
                </button>
              )}
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {isFocused && filteredStudents.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                <span>ผลการค้นหาตรงกัน ({filteredStudents.length} รายการ)</span>
                <span>กดเลือกเพื่อดูผลการเรียน</span>
              </div>
              <ul className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {filteredStudents.map((st) => (
                  <li key={st.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(st)}
                      className="w-full min-h-[48px] text-left px-4 py-3 hover:bg-indigo-50/60 transition flex items-center justify-between group cursor-pointer active:bg-indigo-100/70"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs px-2 py-1 rounded bg-slate-100 text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition">
                          {st.id}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-900 transition">
                            {st.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            ชั้น {st.class} • เลขที่ {st.no}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>

      </div>
    </div>
  );
};
