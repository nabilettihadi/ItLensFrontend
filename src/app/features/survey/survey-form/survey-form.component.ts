import { Component, inject } from '@angular/core';
import { 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators 
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SurveyService } from '../../../core/services/survey.service';
import { Survey } from '../../../core/models/survey.model';

@Component({
  selector: 'app-survey-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">
        {{ isEditMode ? 'Modifier' : 'Créer' }} un sondage
      </h1>

      <form [formGroup]="surveyForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700">
            Titre
          </label>
          <input
            id="title"
            type="text"
            formControlName="title"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          @if (surveyForm.get('title')?.errors?.['required'] && 
               surveyForm.get('title')?.touched) {
            <p class="mt-1 text-sm text-red-600">Le titre est requis</p>
          }
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            formControlName="description"
            rows="4"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-4">
          <button
            type="button"
            (click)="goBack()"
            class="px-4 py-2 border rounded"
          >
            Annuler
          </button>
          <button
            type="submit"
            [disabled]="surveyForm.invalid"
            class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {{ isEditMode ? 'Mettre à jour' : 'Créer' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class SurveyFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private surveyService = inject(SurveyService);

  surveyForm: FormGroup;
  isEditMode = false;
  private surveyId?: number;

  constructor() {
    this.surveyForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.surveyId = +id;
      this.loadSurvey(this.surveyId);
    }
  }

  private loadSurvey(id: number) {
    this.surveyService.getSurvey(id).subscribe({
      next: (survey) => {
        this.surveyForm.patchValue({
          title: survey.title,
          description: survey.description
        });
      },
      error: (error) => console.error('Erreur lors du chargement:', error)
    });
  }

  onSubmit() {
    if (this.surveyForm.valid) {
      const survey: Survey = this.surveyForm.value;
      
      const request = this.isEditMode && this.surveyId
        ? this.surveyService.updateSurvey(this.surveyId, survey)
        : this.surveyService.createSurvey(survey);

      request.subscribe({
        next: () => this.router.navigate(['/surveys']),
        error: (error) => console.error('Erreur lors de la sauvegarde:', error)
      });
    }
  }

  goBack() {
    this.router.navigate(['/surveys']);
  }
}
