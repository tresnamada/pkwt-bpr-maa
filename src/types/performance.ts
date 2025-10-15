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
