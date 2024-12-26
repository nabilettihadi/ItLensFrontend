import { Question } from './question.model';

export interface Subject {
    id?: number;
    title: string;
    parentId?: number;
    surveyEditionId: number;
    children?: Subject[];
    questions?: Question[];
}
