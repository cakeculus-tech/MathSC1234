import { ChapterGroup, ClassStatistics, ScoreCategory, ScoreItem, Student, StudentTaskStatus, SubjectSummary, SubjectType, UnitDefinition, TaskItemStatus } from '../types';

export interface ParsedCSV {
  headers: string[];
  rows: string[][];
  students: Student[];
}

export function parseCSV(text: string): ParsedCSV {
  if (!text || !text.trim()) {
    return { headers: [], rows: [], students: [] };
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const nextC = text[i + 1];

    if (c === '"') {
      if (inQuotes && nextC === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && nextC === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += c;
    }
  }

  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  if (rows.length === 0) {
    return { headers: [], rows: [], students: [] };
  }

  const headers = rows[0].map(h => h.replace(/\\n/g, ' ').replace(/\r?\n/g, ' ').trim());
  const dataRows = rows.slice(1).filter(r => r.length > 1 && (r[0]?.trim().match(/^\d{4,6}/) || r[1]?.trim().length > 0));

  const students: Student[] = dataRows.map(row => {
    const scoresMap: Record<number, string> = {};
    for (let i = 4; i < headers.length; i++) {
      scoresMap[i] = row[i] !== undefined ? row[i].trim() : '';
    }
    return {
      id: row[0]?.trim() || '',
      name: row[1]?.trim() || '',
      class: row[2]?.trim() || '',
      no: row[3]?.trim() || '',
      scores: scoresMap,
    };
  });

  return { headers, rows: dataRows, students };
}

export function serializeCSV(headers: string[], rows: string[][]): string {
  const formatCell = (val: string) => {
    if (!val) return '';
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const headerLine = headers.map(formatCell).join(',');
  const rowLines = rows.map(r => r.map(formatCell).join(',')).join('\n');
  return `${headerLine}\n${rowLines}`;
}

export function detectScoreCategory(header: string): ScoreCategory {
  const h = header.toLowerCase();
  if (h.includes('เกรด')) return 'grade';
  if (h.includes('รวม') && !h.includes('บทที่') && !h.includes('kpa')) return 'total';
  if (h.includes('ปลายภาค')) return 'final';
  if (h.includes('กลางภาค')) return 'midterm';
  if (h.includes('kpa')) return 'kpa';
  if (h.includes('สอบ')) return 'exam';
  if (h.includes('มีส่วนร่วม') || h.includes('จิตพิสัย') || h.includes('เช็คชื่อ')) return 'participation';
  if (h.includes('ส่งงาน') || h.includes('ภาระงาน') || h.includes('การบ้าน') || h.includes('ใบงาน')) return 'assignment';
  return 'other';
}

export function extractMaxScore(header: string): number | null {
  const match = header.match(/\((\d+(\.\d+)?)\)/) || header.match(/(\d+(\.\d+)?)\s*คะแนน/);
  if (match && match[1]) {
    const parsed = parseFloat(match[1]);
    return isNaN(parsed) ? null : parsed;
  }
  // Try finding standalone number after "รวม" e.g. "บทที่ 1 รวม 25"
  const totalMatch = header.match(/รวม\s*(\d+)/i);
  if (totalMatch && totalMatch[1]) {
    const parsed = parseFloat(totalMatch[1]);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

export function groupStudentScores(
  student: Student,
  headers: string[],
  customHeaderNames?: Record<number, string>,
  customUnitTitles?: Record<string, string>
): ChapterGroup[] {
  const groupsMap: Record<string, {
    title: string;
    items: ScoreItem[];
    iconType?: 'chapter' | 'midterm' | 'final' | 'summary';
    badge?: string;
  }> = {};

  for (let i = 4; i < headers.length; i++) {
    const originalHeader = headers[i] || `หัวข้อที่ ${i}`;
    const displayTitle = customHeaderNames?.[i] || originalHeader;
    const rawVal = student.scores[i] ?? '';
    const numericScore = rawVal !== '' && !isNaN(parseFloat(rawVal)) ? parseFloat(rawVal) : null;
    const maxScore = extractMaxScore(displayTitle);
    const category = detectScoreCategory(displayTitle);

    const scoreItem: ScoreItem = {
      index: i,
      header: originalHeader,
      displayTitle,
      score: rawVal,
      numericScore,
      maxScore,
      category,
      isCompleted: rawVal !== '' && rawVal !== '-',
    };

    // Determine group key
    let groupKey = 'other';
    let groupTitle = 'คะแนนทั่วไป / อื่นๆ';
    let iconType: 'chapter' | 'midterm' | 'final' | 'summary' = 'chapter';
    let badge = undefined;

    if (category === 'grade' || (category === 'total' && i >= headers.length - 2)) {
      groupKey = 'summary';
      groupTitle = 'สรุปผลการประเมินและการตัดเกรด';
      iconType = 'summary';
      badge = 'สรุปผลสัมฤทธิ์';
    } else if (category === 'final') {
      groupKey = 'final';
      groupTitle = 'การวัดผลประเมินผลปลายภาคเรียน';
      iconType = 'final';
      badge = 'ปลายภาค';
    } else if (category === 'midterm') {
      groupKey = 'midterm';
      groupTitle = 'การวัดผลประเมินผลกลางภาคเรียน';
      iconType = 'midterm';
      badge = 'กลางภาค';
    } else {
      // Look for chapter number e.g. "บทที่ 1", "บทที่ 2", "หน่วยที่ 1"
      const chapterMatch = displayTitle.match(/(?:บทที่|หน่วยที่|หน่วยการเรียนรู้ที่)\s*(\d+)/i);
      if (chapterMatch) {
        const chNum = chapterMatch[1];
        groupKey = `ch_${chNum}`;
        groupTitle = `หน่วยการเรียนรู้ที่ ${chNum}`;
        iconType = 'chapter';
        badge = `หน่วยที่ ${chNum}`;
      } else if (displayTitle.includes('รวม') || displayTitle.includes('kpa')) {
        const numMatch = displayTitle.match(/\d+/);
        if (numMatch) {
          groupKey = `ch_${numMatch[0]}`;
          groupTitle = `หน่วยการเรียนรู้ที่ ${numMatch[0]}`;
          badge = `หน่วยที่ ${numMatch[0]}`;
        } else {
          groupKey = 'assessment';
          groupTitle = 'คะแนนเก็บระหว่างเรียน';
        }
      } else {
        groupKey = 'assessment';
        groupTitle = 'คะแนนเก็บระหว่างเรียน';
      }
    }

    if (!groupsMap[groupKey]) {
      groupsMap[groupKey] = {
        title: groupTitle,
        items: [],
        iconType,
        badge,
      };
    }
    groupsMap[groupKey].items.push(scoreItem);
  }

  // Calculate subtotals
  const groups: ChapterGroup[] = Object.entries(groupsMap).map(([id, grp]) => {
    let subtotalEarned = 0;
    let subtotalPossible = 0;

    // To prevent double counting (e.g. sub-items and chapter total both in the same chapter),
    // if there is a KPA or รวม item in this chapter, we use that for the chapter subtotal.
    // Otherwise we sum the components.
    const totalOrKpaItem = grp.items.find(it => it.category === 'kpa' || (it.category === 'total' && id.startsWith('ch_')));

    if (totalOrKpaItem && totalOrKpaItem.numericScore !== null) {
      subtotalEarned = totalOrKpaItem.numericScore;
      subtotalPossible = totalOrKpaItem.maxScore ?? 0;
    } else {
      grp.items.forEach(it => {
        if (it.category !== 'grade' && it.category !== 'total') {
          if (it.numericScore !== null) subtotalEarned += it.numericScore;
          if (it.maxScore !== null) subtotalPossible += it.maxScore;
        }
      });
    }

    // Apply custom unit title if configured by teacher
    const finalTitle = customUnitTitles?.[id] || grp.title;

    return {
      id,
      title: finalTitle,
      badge: grp.badge,
      iconType: grp.iconType,
      items: grp.items,
      subtotalEarned: Math.round(subtotalEarned * 10) / 10,
      subtotalPossible: Math.round(subtotalPossible * 10) / 10,
    };
  });

  return groups;
}

/**
 * Extract unique unit/chapter definitions from CSV headers and custom header overrides
 */
export function extractUnitDefinitions(
  headers: string[],
  customHeaderNames?: Record<number, string>
): UnitDefinition[] {
  const unitsMap: Record<string, UnitDefinition> = {};

  for (let i = 4; i < headers.length; i++) {
    const originalHeader = headers[i] || `หัวข้อที่ ${i}`;
    const displayTitle = customHeaderNames?.[i] || originalHeader;
    const category = detectScoreCategory(displayTitle);

    let groupKey = 'other';
    let groupTitle = 'คะแนนทั่วไป / อื่นๆ';
    let badge: string | undefined = undefined;

    if (category === 'grade' || (category === 'total' && i >= headers.length - 2)) {
      groupKey = 'summary';
      groupTitle = 'สรุปผลการประเมินและการตัดเกรด';
      badge = 'สรุปผลสัมฤทธิ์';
    } else if (category === 'final') {
      groupKey = 'final';
      groupTitle = 'การวัดผลประเมินผลปลายภาคเรียน';
      badge = 'ปลายภาค';
    } else if (category === 'midterm') {
      groupKey = 'midterm';
      groupTitle = 'การวัดผลประเมินผลกลางภาคเรียน';
      badge = 'กลางภาค';
    } else {
      const chapterMatch = displayTitle.match(/(?:บทที่|หน่วยที่|หน่วยการเรียนรู้ที่)\s*(\d+)/i);
      if (chapterMatch) {
        const chNum = chapterMatch[1];
        groupKey = `ch_${chNum}`;
        groupTitle = `หน่วยการเรียนรู้ที่ ${chNum}`;
        badge = `หน่วยที่ ${chNum}`;
      } else if (displayTitle.includes('รวม') || displayTitle.includes('kpa')) {
        const numMatch = displayTitle.match(/\d+/);
        if (numMatch) {
          groupKey = `ch_${numMatch[0]}`;
          groupTitle = `หน่วยการเรียนรู้ที่ ${numMatch[0]}`;
          badge = `หน่วยที่ ${numMatch[0]}`;
        } else {
          groupKey = 'assessment';
          groupTitle = 'คะแนนเก็บระหว่างเรียน';
        }
      } else {
        groupKey = 'assessment';
        groupTitle = 'คะแนนเก็บระหว่างเรียน';
      }
    }

    if (!unitsMap[groupKey]) {
      unitsMap[groupKey] = {
        id: groupKey,
        defaultTitle: groupTitle,
        badge,
        items: [],
      };
    }
    unitsMap[groupKey].items.push({
      index: i,
      title: displayTitle,
      category,
    });
  }

  return Object.values(unitsMap);
}

export function calculateGradeFromScore(score: number): { grade: string; label: string; color: string } {
  if (score >= 80) return { grade: '4', label: 'ดีเยี่ยม (Excellent)', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (score >= 75) return { grade: '3.5', label: 'ดีมาก (Very Good)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (score >= 70) return { grade: '3', label: 'ดี (Good)', color: 'text-blue-600 bg-blue-50 border-blue-200' };
  if (score >= 65) return { grade: '2.5', label: 'ค่อนข้างดี (Fairly Good)', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
  if (score >= 60) return { grade: '2', label: 'ปานกลาง (Fair)', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  if (score >= 55) return { grade: '1.5', label: 'พอใช้ (Pass)', color: 'text-orange-600 bg-orange-50 border-orange-200' };
  if (score >= 50) return { grade: '1', label: 'ผ่านเกณฑ์ขั้นต่ำ (Weak)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  return { grade: '0', label: 'ไม่ผ่านเกณฑ์ (Fail)', color: 'text-rose-600 bg-rose-50 border-rose-200' };
}

export function calculateSubjectSummary(student: Student, headers: string[]): SubjectSummary {
  let earnedScore = 0;
  let totalPossibleScore = 0;
  let officialGrade = '';
  let taskCompletionCount = 0;
  let totalTaskCount = 0;
  let examScoreTotal = 0;
  let examPossibleTotal = 0;

  // Check if there is an explicit "รวม" and "เกรด" column
  for (let i = 4; i < headers.length; i++) {
    const h = headers[i].toLowerCase();
    const val = student.scores[i];

    if (h.includes('เกรด')) {
      officialGrade = val || '';
    } else if (h === 'รวม' || h.endsWith('รวม') || (h.includes('รวม') && !h.includes('บทที่') && !h.includes('kpa'))) {
      if (val && !isNaN(parseFloat(val))) {
        earnedScore = parseFloat(val);
      }
    }

    if (h.includes('ส่งงาน') || h.includes('ภาระงาน')) {
      totalTaskCount++;
      if (val && val !== '-' && val !== '0') {
        taskCompletionCount++;
      }
    }

    if (h.includes('สอบ') || h.includes('กลางภาค') || h.includes('ปลายภาค')) {
      const max = extractMaxScore(headers[i]);
      if (max) examPossibleTotal += max;
      if (val && !isNaN(parseFloat(val))) {
        examScoreTotal += parseFloat(val);
      }
    }
  }

  // If explicit total wasn't recorded, compute sum from chapter KPAs / totals + Midterm + Final
  if (earnedScore === 0) {
    for (let i = 4; i < headers.length; i++) {
      const h = headers[i].toLowerCase();
      const val = student.scores[i];
      if (!h.includes('เกรด') && !h.includes('รวม')) {
        // Look for representative items (KPA or Midterm or Final)
        if (h.includes('kpa') || h.includes('กลางภาค') || h.includes('ปลายภาค')) {
          if (val && !isNaN(parseFloat(val))) {
            earnedScore += parseFloat(val);
          }
          const max = extractMaxScore(headers[i]);
          if (max) totalPossibleScore += max;
        }
      }
    }
  }

  if (totalPossibleScore === 0) {
    totalPossibleScore = 100; // standard 100 points scale
  }

  const percentage = Math.min(100, Math.round((earnedScore / totalPossibleScore) * 100));
  const calcGradeObj = calculateGradeFromScore(percentage);

  let status: 'passed' | 'excellent' | 'needs-attention' | 'pending' = 'passed';
  if (percentage >= 80) status = 'excellent';
  else if (percentage < 50 && earnedScore > 0) status = 'needs-attention';
  else if (earnedScore === 0) status = 'pending';

  return {
    earnedScore: Math.round(earnedScore * 10) / 10,
    totalPossibleScore,
    percentage,
    officialGrade: officialGrade || calcGradeObj.grade,
    calculatedGrade: calcGradeObj.grade,
    status,
    taskCompletionCount,
    totalTaskCount,
    examScoreTotal: Math.round(examScoreTotal * 10) / 10,
    examPossibleTotal: Math.round(examPossibleTotal * 10) / 10,
  };
}

export function computeClassStatistics(students: Student[], headers: string[]): ClassStatistics {
  const scores: { id: string; name: string; score: number; grade: string }[] = [];
  const gradeBuckets: Record<string, number> = {
    '4': 0,
    '3.5': 0,
    '3': 0,
    '2.5': 0,
    '2': 0,
    '1.5': 0,
    '1': 0,
    '0': 0,
  };

  students.forEach(st => {
    const summary = calculateSubjectSummary(st, headers);
    scores.push({
      id: st.id,
      name: st.name,
      score: summary.earnedScore,
      grade: summary.officialGrade || summary.calculatedGrade,
    });
    const g = summary.officialGrade || summary.calculatedGrade;
    if (gradeBuckets[g] !== undefined) {
      gradeBuckets[g]++;
    } else {
      gradeBuckets['4']++;
    }
  });

  const validScores = scores.map(s => s.score).filter(s => s > 0);
  const totalStudents = students.length;
  const avg = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;
  const max = validScores.length > 0 ? Math.max(...validScores) : 0;
  const min = validScores.length > 0 ? Math.min(...validScores) : 0;

  const gradeDistribution = Object.entries(gradeBuckets).map(([grade, count]) => ({
    grade,
    count,
    percentage: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0,
  }));

  const topStudents = [...scores].sort((a, b) => b.score - a.score).slice(0, 5);

  return {
    studentCount: totalStudents,
    averageScore: Math.round(avg * 10) / 10,
    maxScore: max,
    minScore: min,
    gradeDistribution,
    topStudents,
  };
}

export function normalizeTaskStatus(val: unknown): TaskItemStatus {
  if (val === true || val === 'passed' || val === 'submitted') return 'passed';
  if (val === 'failed' || val === 'not_passed') return 'failed';
  return 'not_submitted';
}

export function getStudentTaskStatus(
  student: Student,
  headers: string[],
  customSubmissions?: Record<string, StudentTaskStatus>
): StudentTaskStatus {
  // If custom status was explicitly set for this student
  if (customSubmissions && customSubmissions[student.id]) {
    const raw = customSubmissions[student.id];
    return {
      task1: normalizeTaskStatus(raw.task1),
      task2: normalizeTaskStatus(raw.task2),
    };
  }

  // Find assignment columns in headers (starting from index 4)
  const assignmentColIndices: number[] = [];
  for (let i = 4; i < headers.length; i++) {
    const cat = detectScoreCategory(headers[i]);
    if (cat === 'assignment') {
      assignmentColIndices.push(i);
    }
  }

  const checkSubmitted = (colIndex: number | undefined): TaskItemStatus => {
    if (colIndex === undefined) return 'not_submitted';
    const rawVal = student.scores[colIndex];
    if (!rawVal || rawVal.trim() === '' || rawVal.trim() === '-') {
      return 'not_submitted';
    }
    const trimmed = rawVal.trim();
    if (trimmed === '0') {
      return 'failed';
    }
    const num = parseFloat(trimmed);
    if (!isNaN(num)) {
      return num > 0 ? 'passed' : 'failed';
    }
    // Textual hints if teacher entered words in CSV
    if (trimmed.includes('ไม่ผ่าน') || trimmed.includes('แก้')) {
      return 'failed';
    }
    return 'passed';
  };

  const task1 = assignmentColIndices.length > 0 ? checkSubmitted(assignmentColIndices[0]) : 'not_submitted';
  const task2 = assignmentColIndices.length > 1 ? checkSubmitted(assignmentColIndices[1]) : 'not_submitted';

  return { task1, task2 };
}


