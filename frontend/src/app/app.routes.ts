import { Routes } from '@angular/router';
import { SurveyListComponent } from './features/survey/survey-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'surveys', pathMatch: 'full' },
  { path: 'surveys', component: SurveyListComponent },
  { path: '**', redirectTo: 'surveys' }
];
