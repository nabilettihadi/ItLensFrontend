import { Component, computed, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SurveyService } from '../../../core/services/survey.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-survey-detail',
  standalone: true,
  imports: [AsyncPipe, DatePipe, RouterLink],
  template: `
    @if (survey()) {
      <div class="max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold">{{ survey()?.title }}</h1>
          <div class="space-x-4">
            <a [routerLink]="['edit']" 
               class="px-4 py-2 bg-blue-600 text-white rounded">
              Modifier
            </a>
            <button (click)="deleteSurvey()" 
                    class="px-4 py-2 bg-red-600 text-white rounded">
              Supprimer
            </button>
          </div>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <p class="text-gray-600 mb-4">{{ survey()?.description }}</p>
          
          @if (survey()?.editions?.length) {
            <div class="mt-6">
              <h2 class="text-xl font-semibold mb-4">Éditions</h2>
              <div class="grid gap-4">
                @for (edition of survey()?.editions; track edition.id) {
                  <div class="border rounded p-4">
                    <div class="flex justify-between items-center">
                      <h3 class="text-lg font-medium">
                        Édition {{ edition.year }}
                      </h3>
                      <span class="text-sm text-gray-500">
                        Créé le {{ edition.creationDate | date:'mediumDate' }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 mt-2">
                      Début: {{ edition.startDate | date:'mediumDate' }}
                    </p>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="text-center py-8">
        <p>Chargement...</p>
      </div>
    }
  `
})
export class SurveyDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private surveyService = inject(SurveyService);

  private surveyId = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => this.surveyService.getSurvey(Number(params.get('id'))))
    )
  );

  survey = computed(() => this.surveyId());

  async deleteSurvey() {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce sondage ?')) {
      const id = this.survey()?.id;
      if (id) {
        await this.surveyService.deleteSurvey(id).subscribe({
          next: () => this.router.navigate(['/surveys']),
          error: (error) => console.error('Erreur lors de la suppression:', error)
        });
      }
    }
  }
}
