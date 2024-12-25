export interface Survey {
  id?: number;
  title: string;
  description?: string;
  owner?: {
    id: number;
    name: string;
  };
  editions?: SurveyEdition[];
}

export interface SurveyEdition {
  id: number;
  creationDate: Date;
  startDate: Date;
  year: number;
  surveyId: number;
  subjects?: Subject[];
}

export interface Subject {
  id: number;
  title: string;
  parentId?: number;
  surveyEditionId: number;
  children?: Subject[];
  questions?: Question[];
}

export interface Question {
  id: number;
  text: string;
  type: 'CHOIX_UNIQUE' | 'CHOIX_MULTIPLE';
  answerCount: number;
  subjectId: number;
  answers?: Answer[];
}

export interface Answer {
  id: number;
  text: string;
  selectionCount: number;
  percentage: number;
  questionId: number;
}