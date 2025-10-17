export type RatingLevel = 'kurang' | 'cukup' | 'baik' | 'mahir';

export interface PerformanceAspect {
  id: string;
  name: string;
  description: string;
}

export interface PerformanceQuestion {
  id: string;
  question: string;
  rating: RatingLevel | null;
}

export interface PositionTemplate {
  position: string;
  aspects: PerformanceAspect[];
  questions: PerformanceQuestion[];
}

export interface EvaluationHistoryEntry {
  editedAt: Date;
  editedBy: string;
  changes: {
    questionId: string;
    question: string;
    oldRating: RatingLevel;
    newRating: RatingLevel;
  }[];
  oldNotes?: string;
  newNotes?: string;
}

export interface PerformanceEvaluation {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  unit: string;
  evaluationDate: Date;
  questions: {
    questionId: string;
    question: string;
    rating: RatingLevel;
  }[];
  overallNotes: string;
  evaluatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  editHistory?: EvaluationHistoryEntry[];
}

export interface CreatePerformanceEvaluationData {
  employeeId: string;
  employeeName: string;
  position: string;
  unit: string;
  questions: {
    questionId: string;
    question: string;
    rating: RatingLevel;
  }[];
  overallNotes: string;
}

export interface KnowledgeEntry {
  id: string;
  name: string;
  branch: string;
  score: number; // Kept for backward compatibility
  tw1?: number;
  tw2?: number;
  tw3?: number;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
}

export interface CreateKnowledgeData {
  name: string;
  branch: string;
  score: number; // Kept for backward compatibility
  tw1?: number;
  tw2?: number;
  tw3?: number;
}
