import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { SurveyService } from '../../../core/services/survey.service';

@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  template: `
    <div class="mb-4">
      <h1 class="text-2xl font-bold">Sondages</h1>
      <a routerLink="new" 
         class="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded">
        Nouveau sondage
      </a>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      @for (survey of surveys$ | async; track survey.id) {
        <div class="p-4 border rounded shadow">
          <h2 class="text-xl font-semibold">{{ survey.title }}</h2>
          <p class="text-gray-600">{{ survey.description }}</p>
          <div class="mt-4">
            <a [routerLink]="[survey.id]" 
               class="text-blue-600 hover:underline">
              Voir détails
            </a>
          </div>
        </div>
      }
    </div>
  `
})
export class SurveyListComponent {
  private surveyService = inject(SurveyService);
  surveys$ = this.surveyService.getSurveys();
}
