import { Subject } from './subject.model';
import { Survey } from './survey.model';
import { SurveyReference } from './survey-reference.model';

export interface SurveyEdition {
    id?: number;
    creationDate: string;
    startDate: string;
    year: number;
    surveyId?: number;
    survey?: SurveyReference | Survey;
    subjects?: Subject[];
    status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
}
