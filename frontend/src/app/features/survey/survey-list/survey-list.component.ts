import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Survey } from '../../../core/models/survey.model';
import { Owner } from '../../../core/models/owner.model';
import { SurveyEdition } from '../../../core/models/survey-edition.model';
import { SurveyService } from '../../../core/services/survey.service';
import { OwnerService } from '../../../core/services/owner.service';

@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.css']
})
export class SurveyListComponent implements OnInit {
  surveys = signal<Survey[]>([]);
  owners = signal<Owner[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  isCreatingNew = false;
  editingSurveyId: number | null = null;

  // New properties to replace missing ones
  processingOwner = signal(false);
  selectedSurvey: Survey | null = null;

  surveyEditions: { [surveyId: number]: SurveyEdition[] } = {};

  newSurveyForm: FormGroup;
  editSurveyForms: { [key: number]: FormGroup } = {};

  constructor(
    private surveyService: SurveyService,
    private ownerService: OwnerService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.newSurveyForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      owner: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSurveys();
    this.loadOwners();
  }

  loadSurveys(): void {
    this.loading.set(true);
    this.surveyService.getSurveys().subscribe({
      next: (page) => {
        // Filter out surveys without an id
        const validSurveys = page.content.filter(survey => survey.id !== undefined);
        this.surveys.set(validSurveys);
        
        // Load editions for each survey with a valid id
        validSurveys.forEach(survey => {
          if (survey.id) {
            this.loadSurveyEditions(survey.id);
          }
        });
        
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load surveys');
        this.loading.set(false);
      }
    });
  }

  loadSurveyEditions(surveyId: number): void {
    this.surveyService.getSurveyEditionsBySurveyId(surveyId).subscribe({
      next: (editions) => {
        // Sort editions by year in descending order
        this.surveyEditions[surveyId] = editions.sort((a, b) => b.year - a.year);
      },
      error: (err) => {
        console.error(`Failed to load editions for survey ${surveyId}`, err);
        this.surveyEditions[surveyId] = [];
      }
    });
  }

  loadOwners(): void {
    this.ownerService.getOwners().subscribe({
      next: (ownersPage) => {
        this.owners.set(ownersPage.content);
      },
      error: (err) => {
        console.error('Failed to load owners', err);
      }
    });
  }

  startEditing(survey: Survey): void {
    if (survey && survey.id !== undefined) {
      this.editingSurveyId = survey.id;
      // Set selectedSurvey for potential use in delete confirmation
      this.selectedSurvey = survey;
    }
  }

  cancelEditing(): void {
    this.editingSurveyId = null;
    this.selectedSurvey = null;
  }

  updateSurvey(surveyId: number): void {
    const form = this.editSurveyForms[surveyId];
    if (form && form.valid) {
      const selectedOwner = this.owners().find(o => o.id === form.get('owner')?.value);
      
      const updatedSurvey: Survey = {
        id: surveyId,
        title: form.get('title')?.value ?? '',
        description: form.get('description')?.value ?? '',
        owner: {
          id: selectedOwner?.id ?? 0,
          name: selectedOwner?.name ?? ''
        }
      };

      this.processingOwner.set(true);
      this.surveyService.updateSurvey(surveyId, updatedSurvey).subscribe({
        next: (updated) => {
          // Update the survey in the list
          const updatedSurveys = this.surveys().map(s => 
            s.id === surveyId ? { ...s, ...updated } : s
          );
          this.surveys.set(updatedSurveys);
          this.editingSurveyId = null;
          this.processingOwner.set(false);
        },
        error: (err) => {
          console.error('Failed to update survey', err);
          this.error.set('Failed to update survey');
          this.processingOwner.set(false);
        }
      });
    }
  }

  getEditionsForSurvey(surveyId: number | undefined): any[] {
    if (!surveyId) return [];
    const survey = this.surveys().find(s => s.id === surveyId);
    if (!survey) return [];

    // Ajout de vérifications robustes
    if (!survey.editions || !Array.isArray(survey.editions)) {
      return [];
    }

    return survey.editions.filter(edition => edition && edition.year) || [];
  }

  trackBySurveyId(index: number, survey: Survey): number {
    return survey.id ?? index;
  }

  trackByEditionId(index: number, edition: any): number {
    // Ajout de vérifications robustes
    if (!edition || !edition.id && !edition.year) {
      return index;
    }
    return edition.id ?? edition.year ?? index;
  }

  startCreatingNew(): void {
    this.isCreatingNew = true;
  }

  cancelCreatingNew(): void {
    this.isCreatingNew = false;
  }

  createNewSurvey(): void {
    if (this.newSurveyForm.valid) {
      const selectedOwner = this.owners().find(o => o.id === this.newSurveyForm.get('owner')?.value);
      
      const newSurvey: Survey = {
        title: this.newSurveyForm.get('title')?.value ?? '',
        description: this.newSurveyForm.get('description')?.value ?? '',
        owner: {
          id: selectedOwner?.id ?? 0,
          name: selectedOwner?.name ?? ''
        }
      };

      this.processingOwner.set(true);
      this.surveyService.createSurvey(newSurvey).subscribe({
        next: (createdSurvey) => {
          this.surveys.update(surveys => [...surveys, createdSurvey]);
          this.isCreatingNew = false;
          this.newSurveyForm.reset();
          this.processingOwner.set(false);
        },
        error: (err) => {
          console.error('Failed to create survey', err);
          this.error.set('Failed to create survey');
          this.processingOwner.set(false);
        }
      });
    }
  }

  deleteSurvey(): void {
    if (this.selectedSurvey && this.selectedSurvey.id) {
      this.processingOwner.set(true);
      this.surveyService.deleteSurvey(this.selectedSurvey.id).subscribe({
        next: () => {
          this.surveys.update(surveys => surveys.filter(s => s.id !== this.selectedSurvey?.id));
          this.processingOwner.set(false);
          this.selectedSurvey = null;
        },
        error: (err) => {
          console.error('Failed to delete survey', err);
          this.error.set('Failed to delete survey');
          this.processingOwner.set(false);
        }
      });
    }
  }

  confirmDelete(survey: Survey): void {
    this.selectedSurvey = survey;
  }

  navigateToSurveyEdition(edition: SurveyEdition): void {
    if (edition && edition.id) {
      // Navigate to survey edition detail view
      this.router.navigate(['/survey-editions', edition.id]);
    }
  }

  navigateToNewSurveyEdition(surveyId?: number): void {
    if (surveyId) {
      // Navigate to create new survey edition for this survey
      this.router.navigate(['/survey', surveyId, 'editions', 'new']);
    }
  }
}
