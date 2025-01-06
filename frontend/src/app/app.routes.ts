import { Routes } from '@angular/router';

// Survey Components
import { SurveyListComponent } from './features/survey/survey-list/survey-list.component';
import { SurveyDetailComponent } from './features/survey/survey-detail/survey-detail.component';
import { SurveyCreateComponent } from './features/survey/survey-create/survey-create.component';
import { SurveyEditComponent } from './features/survey/survey-edit/survey-edit.component';

// Survey Edition Components
import { SurveyEditionListComponent } from './features/survey-edition/survey-edition-list/survey-edition-list.component';
import { SurveyEditionCreateComponent } from './features/survey-edition/survey-edition-create/survey-edition-create.component';
import { SurveyEditionDetailComponent } from './features/survey-edition/survey-edition-detail/survey-edition-detail.component';

// Subject Components
import { SubjectListComponent } from './features/subject/subject-list/subject-list.component';
import { SubjectDetailComponent } from './features/subject/subject-detail/subject-detail.component';
import { SubjectCreateComponent } from './features/subject/subject-create/subject-create.component';
import { SubjectEditComponent } from './features/subject/subject-edit/subject-edit.component';

// Question Components
import { QuestionListComponent } from './features/question/question-list/question-list.component';
import { QuestionDetailComponent } from './features/question/question-detail/question-detail.component';
import { QuestionCreateComponent } from './features/question/question-create/question-create.component';
import { QuestionEditComponent } from './features/question/question-edit/question-edit.component';

export const routes: Routes = [
  // Default Route
  { path: '', redirectTo: '/surveys', pathMatch: 'full' },

  // Survey Routes (Standalone)
  { path: 'surveys', component: SurveyListComponent },
  { path: 'surveys/new', component: SurveyCreateComponent },
  { path: 'surveys/:id', component: SurveyDetailComponent },
  { path: 'surveys/:id/edit', component: SurveyEditComponent },

  // Survey Edition Routes (Standalone)
  { path: 'survey-editions', component: SurveyEditionListComponent },
  { path: 'survey-editions/new', component: SurveyEditionCreateComponent },
  { path: 'survey-editions/:id', component: SurveyEditionDetailComponent },
  { path: 'survey/:surveyId/editions/:year', component: SurveyEditionDetailComponent },

  // Subject Routes (Standalone)
  { path: 'subjects', component: SubjectListComponent },
  { path: 'subjects/new', component: SubjectCreateComponent },
  { path: 'subjects/:id', component: SubjectDetailComponent },
  { path: 'subjects/:id/edit', component: SubjectEditComponent },

  // Question Routes (Standalone)
  { path: 'questions', component: QuestionListComponent },
  { path: 'questions/new', component: QuestionCreateComponent },
  { path: 'questions/:id', component: QuestionDetailComponent },
  { path: 'questions/edit/:id', component: QuestionEditComponent },

  // Answer Routes (Module-based)
  {
    path: 'answers',
    loadChildren: () => import('./features/answer/answer.module').then(m => m.AnswerModule)
  }
];