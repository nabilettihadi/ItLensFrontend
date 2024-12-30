import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Survey } from '../../../core/models/survey.model';
import { Owner } from '../../../core/models/owner.model';
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

  newSurveyForm: FormGroup;
  editSurveyForms: { [key: number]: FormGroup } = {};

  constructor(
    private surveyService: SurveyService,
    private ownerService: OwnerService,
    private fb: FormBuilder
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
      next: (surveysPage) => {
        this.surveys.set(surveysPage.content);
        
        // Prepare edit forms for each survey
        surveysPage.content.forEach(survey => {
          if (survey && survey.id !== undefined) {
            this.editSurveyForms[survey.id] = this.fb.group({
              title: [survey.title ?? '', [Validators.required, Validators.minLength(3)]],
              description: [survey.description ?? '', [Validators.required, Validators.minLength(10)]],
              owner: [survey.owner?.id ?? null, Validators.required]
            });
          }
        });
        
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load surveys');
        this.loading.set(false);
        console.error(err);
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
    return survey?.editions ?? [];
  }

  trackBySurveyId(index: number, survey: Survey): number {
    return survey.id ?? index;
  }

  trackByEditionId(index: number, edition: any): number {
    return edition.id ?? index;
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
}
