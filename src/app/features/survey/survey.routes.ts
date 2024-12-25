import { Routes } from '@angular/router';
import { SurveyListComponent } from './survey-list/survey-list.component';
import { SurveyDetailComponent } from './survey-detail/survey-detail.component';
import { SurveyFormComponent } from './survey-form/survey-form.component';

export const SURVEY_ROUTES: Routes = [
  {
    path: '',
    component: SurveyListComponent,
  },
  {
    path: 'new',
    component: SurveyFormComponent,
  },
  {
    path: ':id',
    component: SurveyDetailComponent,
  },
  {
    path: ':id/edit',
    component: SurveyFormComponent,
  }
]; 