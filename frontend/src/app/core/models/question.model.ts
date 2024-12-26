import { Answer } from './answer.model';
import { QuestionType } from './question-type.enum';

export interface Question {
    id?: number;
    text: string;
    type: QuestionType;
    answerCount?: number;
    subjectId: number;
    answers?: Answer[];
}
