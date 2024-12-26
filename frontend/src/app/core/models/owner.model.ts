import { Survey } from './survey.model';

export interface Owner {
    id?: number;
    name: string;
    surveys?: Survey[];
}
