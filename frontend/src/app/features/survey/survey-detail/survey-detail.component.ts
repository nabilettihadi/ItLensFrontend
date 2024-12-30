import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Survey } from '../../../core/models/survey.model';
import { SurveyService } from '../../../core/services/survey.service';
import { SurveyEdition } from '../../../core/models/survey-edition.model';
import { SurveyEditionService } from '../../../core/services/survey-edition.service';
import { HttpErrorResponse } from '@angular/common/http';

declare var bootstrap: any;

@Component({
  selector: 'app-survey-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './survey-detail.component.html',
  styleUrls: ['./survey-detail.component.css']
})
export class SurveyDetailComponent implements OnInit {
  survey = signal<Survey | null>(null);
  surveyEditions = signal<SurveyEdition[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedEdition: SurveyEdition | null = null;
  deleteModal: any;
  deleteEditionModal: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveyService: SurveyService,
    private surveyEditionService: SurveyEditionService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadSurvey(+id);
        this.loadSurveyEditions(+id);
      }
    });

    // Initialize modals
    this.deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    this.deleteEditionModal = new bootstrap.Modal(document.getElementById('deleteEditionModal'));
  }

  loadSurvey(id: number): void {
    this.loading.set(true);
    this.surveyService.getSurveyById(id).subscribe({
      next: (survey: Survey) => {
        this.survey.set(survey);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        if (error instanceof HttpErrorResponse) {
          this.error.set(error.error?.message || 'Failed to load survey');
        }
      }
    });
  }

  loadSurveyEditions(surveyId: number): void {
    this.loading.set(true);
    this.surveyEditionService.getSurveyEditionsBySurveyId(surveyId).subscribe({
      next: (editions: SurveyEdition[]) => {
        this.surveyEditions.set(editions);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        if (error instanceof HttpErrorResponse) {
          this.error.set(error.error?.message || 'Failed to load survey editions');
        }
      }
    });
  }

  confirmDelete(): void {
    this.deleteModal.show();
  }

  deleteSurvey(): void {
    const currentSurvey = this.survey();
    if (currentSurvey && currentSurvey.id) {
      this.surveyService.deleteSurvey(currentSurvey.id).subscribe({
        next: () => {
          this.deleteModal.hide();
          this.router.navigate(['/surveys']);
        },
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse) {
            this.error.set(error.error?.message || 'Failed to delete survey');
          }
          this.deleteModal.hide();
        }
      });
    }
  }

  deleteEdition(edition: SurveyEdition): void {
    this.selectedEdition = edition;
    this.deleteEditionModal.show();
  }

  confirmDeleteEdition(): void {
    if (this.selectedEdition && this.selectedEdition.id !== undefined) {
      this.surveyEditionService.deleteSurveyEdition(this.selectedEdition.id).subscribe({
        next: () => {
          this.deleteEditionModal.hide();
          const currentSurvey = this.survey();
          if (currentSurvey && currentSurvey.id) {
            this.loadSurveyEditions(currentSurvey.id);
          }
        },
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse) {
            this.error.set(error.error?.message || 'Failed to delete edition');
          }
          this.deleteEditionModal.hide();
        }
      });
    }
  }
}
