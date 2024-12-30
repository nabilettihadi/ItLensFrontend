import { Routes } from '@angular/router';
import { SurveyListComponent } from './features/survey/survey-list/survey-list.component';
import { SurveyDetailComponent } from './features/survey/survey-detail/survey-detail.component';
import { SurveyEditionCreateComponent } from './features/survey-edition/survey-edition-create/survey-edition-create.component';
import { SurveyEditionDetailComponent } from './features/survey-edition/survey-edition-detail/survey-edition-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: '/surveys', pathMatch: 'full' },
  { path: 'surveys', component: SurveyListComponent },
  { 
    path: 'surveys/new', 
    loadComponent: () => import('./features/survey/survey-create/survey-create.component')
      .then(m => m.SurveyCreateComponent) 
  },
  { 
    path: 'surveys/:id', 
    component: SurveyDetailComponent 
  },
  { 
    path: 'surveys/:id/edit', 
    loadComponent: () => import('./features/survey/survey-edit/survey-edit.component')
      .then(m => m.SurveyEditComponent) 
  },
  // Survey Edition Routes
  { 
    path: 'surveys/:surveyId/editions/new', 
    component: SurveyEditionCreateComponent 
  },
  { 
    path: 'surveys/:surveyId/editions/:editionId', 
    component: SurveyEditionDetailComponent 
  },
  { path: '**', redirectTo: 'surveys' }
];
