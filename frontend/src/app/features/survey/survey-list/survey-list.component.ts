import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { of, switchMap, map, filter, catchError } from 'rxjs';

import { Survey } from '../../../core/models/survey.model';
import { Owner } from '../../../core/models/owner.model';
import { SurveyEdition } from '../../../core/models/survey-edition.model';
import { SurveyService } from '../../../core/services/survey.service';
import { OwnerService } from '../../../core/services/owner.service';
import { SurveyEditionService } from '../../../core/services/survey-edition.service';
import { Page } from '../../../core/models/page.model';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
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

  private _draftSurvey: Survey | null = null;

  get draftSurvey(): Survey | null {
    return this._draftSurvey;
  }

  get draftSurveyTitle(): string {
    return this._draftSurvey?.title || '';
  }

  set draftSurveyTitle(value: string) {
    if (this._draftSurvey) {
      this._draftSurvey.title = value;
    }
  }

  get draftSurveyDescription(): string {
    return this._draftSurvey?.description || '';
  }

  set draftSurveyDescription(value: string) {
    if (this._draftSurvey) {
      this._draftSurvey.description = value;
    }
  }

  get draftSurveyOwnerName(): string {
    return this._draftSurvey?.owner?.name || '';
  }

  set draftSurveyOwnerName(value: string) {
    if (this._draftSurvey) {
      if (!this._draftSurvey.owner) {
        this._draftSurvey.owner = { name: value };
      } else {
        this._draftSurvey.owner.name = value;
      }
    }
  }

  creationError: string | null = null;

  constructor(
    private surveyService: SurveyService,
    private ownerService: OwnerService,
    private surveyEditionService: SurveyEditionService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.newSurveyForm = this.fb.group({
      title: [''],
      description: [''],
      owner: [null]
    });
  }

  ngOnInit(): void {
    this.loadSurveys();
    this.loadOwners();
  }

  loadSurveys(): void {
    this.loading.set(true);
    this.surveyService.getAllSurveys().subscribe({
      next: (page: any) => {
        // Filter out surveys without an id
        const validSurveys = page.content.filter((survey: Survey) => survey.id !== undefined);
        this.surveys.set(validSurveys);
        
        // Load editions for each survey with a valid id
        validSurveys.forEach((survey: Survey) => {
          if (survey.id) {
            this.loadSurveyEditions(survey.id);
          }
        });
        
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set('Failed to load surveys');
        this.loading.set(false);
      }
    });
  }

  loadSurveyEditions(surveyId: number): void {
    this.surveyEditionService.getEditionsBySurveyId(surveyId).subscribe({
      next: (editions: SurveyEdition[]) => {
        // Sort editions by year in descending order
        if (editions) {
          this.surveyEditions[surveyId] = editions.sort((a: SurveyEdition, b: SurveyEdition) => b.year - a.year);
        } else {
          this.surveyEditions[surveyId] = [];
        }
      },
      error: (err: Error) => {
        console.error(`Failed to load editions for survey ${surveyId}`, err);
        this.surveyEditions[surveyId] = [];
      }
    });
  }

  loadOwners(): void {
    this.ownerService.getOwners().subscribe({
      next: (response: Page<Owner>) => {
        if (response && response.content) {
          this.owners.set(response.content);
        } else {
          this.owners.set([]);
        }
      },
      error: (err: Error) => {
        console.error('Failed to load owners', err);
        this.error.set('Failed to load owners');
        this.owners.set([]);
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
        next: (updated: any) => {
          // Mettre à jour le sondage dans la liste
          const updatedSurveys = this.surveys().map(s => 
            s.id === surveyId ? { ...s, ...updated } : s
          );
          this.surveys.set(updatedSurveys);
          this.editingSurveyId = null;
          this.processingOwner.set(false);
        },
        error: (err: Error) => {
          console.error('Échec de la mise à jour du sondage', err);
          this.error.set('Échec de la mise à jour du sondage');
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
    // If already creating a survey, do nothing
    if (this.isCreatingNew) {
      return;
    }

    // Create a new draft survey with safe initialization
    this._draftSurvey = {
      title: '',
      description: '',
      owner: { name: '' }
    };
    this.isCreatingNew = true;
    this.creationError = null;
  }

  cancelCreatingNew(): void {
    this.isCreatingNew = false;
    this._draftSurvey = null;
    this.creationError = null;
  }

  createNewSurvey(): void {
    // Validate draft survey
    if (!this._draftSurvey) {
      this.creationError = 'No draft survey found';
      return;
    }

    // Validate title
    const title = this._draftSurvey.title?.trim() || '';
    if (title.length < 3) {
      this.creationError = 'Title must be at least 3 characters long';
      return;
    }

    // Validate description
    const description = this._draftSurvey.description?.trim() || '';
    if (description.length < 10) {
      this.creationError = 'Description must be at least 10 characters long';
      return;
    }

    // Validate owner
    const ownerName = this._draftSurvey.owner?.name?.trim() || '';
    if (ownerName.length === 0) {
      this.creationError = 'Owner name is required';
      return;
    }

    // Create owner first
    this.ownerService.createOwner({ name: ownerName }).pipe(
      switchMap(owner => {
        // Prepare survey for creation with full owner object
        const surveyToCreate: Survey = {
          title: title,
          description: description,
          owner: owner
        };

        // Create survey
        return this.surveyService.createSurvey(surveyToCreate);
      })
    ).subscribe({
      next: (createdSurvey: any) => {
        // Add to surveys list
        this.surveys.update(surveys => [...surveys, createdSurvey]);
        
        // Reset creation state
        this.isCreatingNew = false;
        this._draftSurvey = null;
        this.creationError = null;
      },
      error: (err: Error) => {
        // Handle creation error
        this.creationError = 'Failed to create survey. Please try again.';
        console.error('Survey creation error', err);
      }
    });
  }

  confirmDelete(survey: Survey): void {
    if (!survey.id) {
      console.error('Cannot delete survey without an ID');
      return;
    }

    // Assuming you have a modal for confirmation
    this.selectedSurvey = survey;
    // Trigger modal open (you might need to use ViewChild or a service to control modal)
    const deleteModal = document.getElementById('deleteConfirmModal');
    if (deleteModal) {
      // @ts-ignore
      new bootstrap.Modal(deleteModal).show();
    }
  }

  deleteSurvey(): void {
    if (!this.selectedSurvey || !this.selectedSurvey.id) {
      this.error.set('No survey selected for deletion');
      return;
    }

    this.processingOwner.set(true);
    this.surveyService.deleteSurvey(this.selectedSurvey.id).subscribe({
      next: () => {
        // Remove the deleted survey from the list
        this.surveys.update(surveys => 
          surveys.filter(s => s.id !== this.selectedSurvey!.id)
        );
        this.selectedSurvey = null;
        this.processingOwner.set(false);
        
        // Close the modal
        const deleteModal = document.getElementById('deleteConfirmModal');
        if (deleteModal) {
          // @ts-ignore
          bootstrap.Modal.getInstance(deleteModal)?.hide();
        }
      },
      error: (err: Error) => {
        console.error('Échec de la suppression du sondage', err);
        this.error.set('Échec de la suppression du sondage');
        this.processingOwner.set(false);
      }
    });
  }

  navigateToSurveyEdition(edition: SurveyEdition): void {
    if (edition.id) {
      this.router.navigate(['/survey-editions', edition.id]);
    }
  }

  navigateToNewSurveyEdition(surveyId?: number): void {
    if (surveyId) {
      this.router.navigate([`/survey/${surveyId}/editions/new`]);
    }
  }
}
