import { Owner } from './owner.model';
import { SurveyEdition } from './survey-edition.model';

export interface Survey {
    id?: number;
    title: string;
    description?: string;
    owner?: Owner;
    editions?: SurveyEdition[];
}
