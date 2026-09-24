export type SubjectType = 'base' | 'extra';

export interface Student {
  id: string;
  name: string;
  class: string;
  no: string;
  scores: Record<number, string>;
}

export type ScoreCategory = 
  | 'assignment' 
  | 'participation' 
  | 'exam' 
  | 'kpa' 
  | 'midterm' 
  | 'final' 
  | 'total' 
  | 'grade' 
  | 'other';

export interface ScoreItem {
  index: number;
  header: string;
  displayTitle: string;
  score: string;
  numericScore: number | null;
  maxScore: number | null;
  category: ScoreCategory;
  isCompleted: boolean;
}

export interface ChapterGroup {
  id: string;
  title: string;
  badge?: string;
  iconType?: 'chapter' | 'midterm' | 'final' | 'summary';
  items: ScoreItem[];
  subtotalEarned: number;
  subtotalPossible: number;
}

export interface SubjectSummary {
  earnedScore: number;
  totalPossibleScore: number;
  percentage: number;
  officialGrade: string;
  calculatedGrade: string;
  status: 'passed' | 'excellent' | 'needs-attention' | 'pending';
  taskCompletionCount: number;
  totalTaskCount: number;
  examScoreTotal: number;
  examPossibleTotal: number;
}

export interface SubjectMeta {
  type: SubjectType;
  title: string;
  code: string;
  teacherName: string;
  description: string;
}

export interface SchoolInfo {
  schoolName: string;
  department: string;
  academicYear: string;
  semester: string;
  className: string;
  teacherName: string;
  teacherEmail: string;
}

export interface ClassStatistics {
  studentCount: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  gradeDistribution: {
    grade: string;
    count: number;
    percentage: number;
  }[];
  topStudents: { id: string; name: string; score: number }[];
}

export interface UnitDefinition {
  id: string;
  defaultTitle: string;
  badge?: string;
  items: { index: number; title: string; category: ScoreCategory }[];
}

export type TaskItemStatus = 'passed' | 'failed' | 'not_submitted';

export interface TaskDefinitions {
  task1: string;
  task2: string;
}

export interface StudentTaskStatus {
  task1: TaskItemStatus;
  task2: TaskItemStatus;
}

export type GradeVisibility = Record<SubjectType, boolean>;

