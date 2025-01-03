import { Subject } from './subject.model';
import { Survey } from './survey.model';

export interface SurveyEdition {
    id?: number;
    creationDate: string;
    startDate: string;
    year: number;
    survey?: Survey;
    subjects?: Subject[];
}
