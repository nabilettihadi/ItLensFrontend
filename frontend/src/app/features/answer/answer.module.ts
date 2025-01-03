import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { AnswerListComponent } from './answer-list/answer-list.component';
import { AnswerDetailComponent } from './answer-detail/answer-detail.component';
import { AnswerCreateComponent } from './answer-create/answer-create.component';
import { AnswerEditComponent } from './answer-edit/answer-edit.component';

const routes: Routes = [
  { path: '', component: AnswerListComponent },
  { path: 'new', component: AnswerCreateComponent },
  { path: ':id', component: AnswerDetailComponent },
  { path: 'edit/:id', component: AnswerEditComponent }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class AnswerModule { }
