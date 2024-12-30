import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { Survey } from '../../../core/models/survey.model';
import { SurveyService } from '../../../core/services/survey.service';
import { SurveyEdition } from '../../../core/models/survey-edition.model';
import { SurveyEditionService } from '../../../core/services/survey-edition.service';
import { Owner } from '../../../core/models/owner.model';
import { OwnerService } from '../../../core/services/owner.service';
import { RangePipe } from '../../../shared/pipes/range.pipe';

declare var bootstrap: any;

@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, RangePipe],
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.css']
})
export class SurveyListComponent implements OnInit {
  protected readonly Math = Math;
  surveys = signal<Survey[]>([]);
  surveyEditions = signal<{ [key: number]: SurveyEdition[] }>({});
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedSurvey: Survey | null = null;
  editingId: number | null = null;
  editForms: { [key: number]: FormGroup } = {};
  deleteModal: any;
  isCreatingNew = false;
  newSurveyForm: FormGroup;
  processingOwner = signal<boolean>(false);

  // Pagination
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);

  getFormGroup(surveyId: number): FormGroup {
    if (!this.editForms[surveyId]) {
      this.editForms[surveyId] = this.createEditForm({
        title: '',
        description: '',
        ownerName: ''
      });
    }
    return this.editForms[surveyId];
  }

  constructor(
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private surveyEditionService: SurveyEditionService,
    private ownerService: OwnerService
  ) {
    console.log('SurveyListComponent constructed');
    this.newSurveyForm = this.createEditForm({
      title: '',
      description: '',
      ownerName: ''
    });
  }

  ngOnInit(): void {
    console.log('SurveyListComponent initialized');
    this.loadSurveys();
    this.deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
  }

  loadSurveys(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.surveyService.getSurveys(this.currentPage(), this.pageSize())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (page) => {
          console.log('Surveys loaded:', page);
          this.surveys.set(page.content);
          this.totalElements.set(page.totalElements);
          this.totalPages.set(page.totalPages);
          page.content.forEach(survey => {
            if (survey.id) {
              this.loadEditionsForSurvey(survey.id);
              this.editForms[survey.id] = this.createEditForm({
                ...survey,
                ownerName: survey.owner?.name || ''
              });
            }
          });
        },
        error: (error: unknown) => {
          console.error('Error loading surveys:', error);
          if (error instanceof HttpErrorResponse) {
            this.error.set(error.error?.message || 'Failed to load surveys');
          }
        }
      });
  }

  loadEditionsForSurvey(surveyId: number): void {
    console.log(`Loading editions for survey ${surveyId}...`);
    this.surveyEditionService.getSurveyEditionsBySurveyId(surveyId)
      .subscribe({
        next: (editions: SurveyEdition[]) => {
          console.log(`Editions loaded for survey ${surveyId}:`, editions);
          // Trier les éditions par année
          const sortedEditions = editions.sort((a, b) => a.year - b.year);
          this.surveyEditions.update(current => {
            const updated = {
              ...current,
              [surveyId]: sortedEditions
            };
            console.log('Updated surveyEditions:', updated);
            return updated;
          });
        },
        error: (error: unknown) => {
          console.error(`Failed to load editions for survey ${surveyId}:`, error);
          this.surveyEditions.update(current => ({
            ...current,
            [surveyId]: []
          }));
          if (error instanceof HttpErrorResponse) {
            console.error(`HTTP Error: ${error.status} - ${error.error?.message || error.message}`);
          }
        }
      });
  }

  getEditionsForSurvey(surveyId: number | undefined): SurveyEdition[] {
    if (!surveyId) {
      console.log('No surveyId provided');
      return [];
    }
    const editions = this.surveyEditions()[surveyId] || [];
    console.log(`Getting editions for survey ${surveyId}:`, editions);
    return editions;
  }

  trackBySurveyId(index: number, survey: Survey): number {
    return survey.id || index;
  }

  trackByEditionId(index: number, edition: SurveyEdition): number {
    return edition.id || index;
  }

  isEditing(surveyId: number | undefined): boolean {
    return surveyId !== undefined && this.editingId === surveyId;
  }

  createEditForm(data: { title: string; description?: string; ownerName: string }): FormGroup {
    return this.fb.group({
      title: [data.title, [Validators.required, Validators.minLength(3)]],
      description: [data.description],
      ownerName: [data.ownerName, [Validators.required, Validators.minLength(2)]]
    });
  }

  startEditing(survey: Survey): void {
    if (!survey.id) return;
    console.log('Starting edit for survey:', survey);
    this.editingId = survey.id;
    this.editForms[survey.id] = this.createEditForm({
      ...survey,
      ownerName: survey.owner?.name || ''
    });
  }

  cancelEditing(surveyId: number): void {
    console.log('Canceling edit for survey:', surveyId);
    this.editingId = null;
  }

  updateSurvey(surveyId: number): void {
    const form = this.editForms[surveyId];
    if (!form?.valid) return;

    console.log('Updating survey:', surveyId, form.value);
    const formValue = form.value;
    this.processingOwner.set(true);

    this.ownerService.getOrCreateOwner(formValue.ownerName)
      .pipe(finalize(() => this.processingOwner.set(false)))
      .subscribe({
        next: (owner: Owner) => {
          const updatedSurvey: Survey = {
            ...this.surveys().find(s => s.id === surveyId),
            title: formValue.title,
            description: formValue.description,
            owner: owner
          };

          console.log('Sending updated survey:', updatedSurvey);
          this.surveyService.updateSurvey(surveyId, updatedSurvey).subscribe({
            next: (survey: Survey) => {
              console.log('Survey updated:', survey);
              this.surveys.update(surveys => 
                surveys.map(s => s.id === surveyId ? survey : s)
              );
              this.editingId = null;
              this.error.set(null);
            },
            error: (error: unknown) => {
              console.error('Error updating survey:', error);
              if (error instanceof HttpErrorResponse) {
                this.error.set(error.error?.message || 'Failed to update survey');
              }
            }
          });
        },
        error: (error: unknown) => {
          console.error('Error processing owner:', error);
          if (error instanceof HttpErrorResponse) {
            this.error.set(error.error?.message || 'Failed to process owner');
          }
        }
      });
  }

  confirmDelete(survey: Survey): void {
    if (!survey.id) return;
    console.log('Confirming delete for survey:', survey);
    this.selectedSurvey = survey;
    this.deleteModal.show();
  }

  deleteSurvey(): void {
    if (!this.selectedSurvey?.id) return;

    console.log('Deleting survey:', this.selectedSurvey);
    this.surveyService.deleteSurvey(this.selectedSurvey.id).subscribe({
      next: () => {
        console.log('Survey deleted successfully');
        this.surveys.update(surveys => 
          surveys.filter(s => s.id !== this.selectedSurvey?.id)
        );
        this.deleteModal.hide();
        this.selectedSurvey = null;
        this.error.set(null);
      },
      error: (error: unknown) => {
        console.error('Error deleting survey:', error);
        if (error instanceof HttpErrorResponse) {
          this.error.set(error.error?.message || 'Failed to delete survey');
        }
        this.deleteModal.hide();
      }
    });
  }

  startCreatingNew(): void {
    console.log('Starting new survey creation');
    this.isCreatingNew = true;
    this.newSurveyForm.reset({
      title: '',
      description: '',
      ownerName: ''
    });
  }

  cancelCreatingNew(): void {
    console.log('Canceling new survey creation');
    this.isCreatingNew = false;
  }

  createNewSurvey(): void {
    if (this.newSurveyForm.invalid) {
      this.error.set('Please fill in all required fields correctly');
      return;
    }

    console.log('Creating new survey:', this.newSurveyForm.value);
    const formValue = this.newSurveyForm.value;
    this.error.set(null);
    this.processingOwner.set(true);

    this.ownerService.getOrCreateOwner(formValue.ownerName)
      .pipe(finalize(() => this.processingOwner.set(false)))
      .subscribe({
        next: (owner: Owner) => {
          const newSurvey: Survey = {
            title: formValue.title,
            description: formValue.description,
            owner: owner
          };

          console.log('Sending new survey:', newSurvey);
          this.surveyService.createSurvey(newSurvey).subscribe({
            next: (survey: Survey) => {
              console.log('Survey created:', survey);
              this.surveys.update(surveys => [...surveys, survey]);
              this.isCreatingNew = false;
              this.error.set(null);
              if (survey.id) {
                this.loadEditionsForSurvey(survey.id);
              }
            },
            error: (error: unknown) => {
              console.error('Error creating survey:', error);
              if (error instanceof HttpErrorResponse) {
                let errorMessage = 'Failed to create survey';
                if (error.status === 400) {
                  errorMessage = error.error?.message || 'Invalid survey data';
                } else if (error.status === 403) {
                  errorMessage = 'You do not have permission to create surveys';
                } else if (error.status === 409) {
                  errorMessage = 'A survey with this title already exists';
                } else if (error.status >= 500) {
                  errorMessage = 'Server error occurred. Please try again later';
                }
                this.error.set(errorMessage);
              } else {
                this.error.set('An unexpected error occurred');
              }
            }
          });
        },
        error: (error: unknown) => {
          console.error('Error processing owner:', error);
          if (error instanceof HttpErrorResponse) {
            let errorMessage = 'Failed to process owner';
            if (error.status === 400) {
              errorMessage = error.error?.message || 'Invalid owner name';
            } else if (error.status === 409) {
              errorMessage = 'Owner name conflict. Please try a different name';
            } else if (error.status >= 500) {
              errorMessage = 'Server error occurred while processing owner. Please try again later';
            }
            this.error.set(errorMessage);
          } else {
            this.error.set('An unexpected error occurred while processing owner');
          }
        }
      });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadSurveys();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0); // Reset to first page when changing page size
    this.loadSurveys();
  }
}
