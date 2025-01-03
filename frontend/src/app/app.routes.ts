import { Routes } from '@angular/router';
import { SurveyListComponent } from './features/survey/survey-list/survey-list.component';
import { SurveyDetailComponent } from './features/survey/survey-detail/survey-detail.component';
import { SurveyEditComponent } from './features/survey/survey-edit/survey-edit.component';
import { SurveyEditionCreateComponent } from './features/survey-edition/survey-edition-create/survey-edition-create.component';
import { SurveyEditionDetailComponent } from './features/survey-edition/survey-edition-detail/survey-edition-detail.component';
import { SubjectListComponent } from './features/subject/subject-list/subject-list.component';
import { SubjectDetailComponent } from './features/subject/subject-detail/subject-detail.component';
import { QuestionListComponent } from './features/question/question-list/question-list.component';
import { QuestionDetailComponent } from './features/question/question-detail/question-detail.component';
import { AnswerListComponent } from './features/answer/answer-list/answer-list.component';
import { AnswerCreateComponent } from './features/answer/answer-create/answer-create.component';
import { AnswerDetailComponent } from './features/answer/answer-detail/answer-detail.component';
import { SurveyEditionListComponent } from './features/survey-edition/survey-edition-list/survey-edition-list.component';
import { SurveyCreateComponent } from './features/survey/survey-create/survey-create.component';

export const routes: Routes = [
  { path: '', redirectTo: '/surveys', pathMatch: 'full' },
  
  // Survey Routes (aligned with /api/surveys)
  { path: 'surveys', component: SurveyListComponent },
  { path: 'surveys/new', component: SurveyCreateComponent },
  { path: 'surveys/:id', component: SurveyDetailComponent },
  { path: 'surveys/:id/edit', component: SurveyEditComponent },
  { path: 'surveys/owner/:ownerId', component: SurveyListComponent },
  
  // Survey Edition Routes (aligned with /api/survey-editions)
  { path: 'survey-editions', component: SurveyEditionListComponent },
  { path: 'survey-editions/new', component: SurveyEditionCreateComponent },
  { path: 'survey-editions/:id', component: SurveyEditionDetailComponent },
  { path: 'survey-editions/:id/edit', component: SurveyEditionCreateComponent },
  { path: 'survey-editions/survey/:surveyId', component: SurveyEditionListComponent },
  
  // Answer Routes (aligned with /api/answers)
  { path: 'answers', component: AnswerListComponent },
  { path: 'answers/new', component: AnswerCreateComponent },
  { path: 'answers/:id', component: AnswerDetailComponent },
  { path: 'answers/:id/edit', component: AnswerDetailComponent },
  { path: 'answers/question/:questionId', component: AnswerListComponent },
  
  // Subject Routes
  { path: 'subjects', component: SubjectListComponent },
  { path: 'subjects/:id', component: SubjectDetailComponent },
  
  // Question Routes
  { path: 'questions', component: QuestionListComponent },
  { path: 'questions/:id', component: QuestionDetailComponent },
];