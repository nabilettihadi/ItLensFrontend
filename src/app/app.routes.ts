import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'surveys',
    loadChildren: () => import('./features/survey/survey.routes').then(m => m.SURVEY_ROUTES)
  },
  {
    path: '',
    redirectTo: 'surveys',
    pathMatch: 'full'
  }
];
