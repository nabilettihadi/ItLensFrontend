import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SurveyListComponent } from './features/survey/survey-list/survey-list.component';
import { SurveyDetailComponent } from './features/survey/survey-detail/survey-detail.component';
import { SurveyEditComponent } from './features/survey/survey-edit/survey-edit.component';
import { SurveyEditionListComponent } from './features/survey-edition/survey-edition-list/survey-edition-list.component';
import { SurveyEditionDetailComponent } from './features/survey-edition/survey-edition-detail/survey-edition-detail.component';
import { SurveyEditionCreateComponent } from './features/survey-edition/survey-edition-create/survey-edition-create.component';

export const routes: Routes = [
  { path: 'surveys', component: SurveyListComponent },
  { path: 'surveys/new', component: SurveyEditComponent },
  { path: 'surveys/edit/:id', component: SurveyEditComponent },
  { path: 'surveys/:id', component: SurveyDetailComponent },
  
  // Survey Editions Routes
  { path: 'survey-editions', component: SurveyEditionListComponent },
  { path: 'survey/:surveyId/editions', component: SurveyEditionListComponent },
  { path: 'survey/:surveyId/editions/new', component: SurveyEditionCreateComponent },
  { path: 'survey/:surveyId/editions/:editionId/edit', component: SurveyEditionCreateComponent },
  { path: 'survey-editions/:editionId', component: SurveyEditionDetailComponent },
  { path: 'surveys/:surveyId/editions/:editionId', component: SurveyEditionDetailComponent },
  
  { path: '', redirectTo: '/surveys', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
