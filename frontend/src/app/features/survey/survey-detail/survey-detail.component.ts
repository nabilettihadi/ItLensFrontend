import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Survey } from '../../../core/models/survey.model';
import { SurveyService } from '../../../core/services/survey.service';
import { SurveyEdition } from '../../../core/models/survey-edition.model';
import { SurveyEditionService } from '../../../core/services/survey-edition.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
    private surveyEditionService: SurveyEditionService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadSurvey(+id);
      } else {
        this.error.set('Survey ID not found');
      }
    });

    // Initialize modals after a short delay to ensure DOM elements are ready
    setTimeout(() => {
      const deleteModalEl = document.getElementById('deleteModal');
      const deleteEditionModalEl = document.getElementById('deleteEditionModal');
      
      if (deleteModalEl) {
        this.deleteModal = deleteModalEl;
      }
      
      if (deleteEditionModalEl) {
        this.deleteEditionModal = deleteEditionModalEl;
      }
    }, 100);
  }

  loadSurvey(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.surveyService.getSurveyById(id).pipe(
      tap((survey: Survey) => {
        console.log('Loaded survey:', survey);
        this.survey.set(survey);
        if (survey.id) {
          this.loadSurveyEditions(survey.id);
        }
      }),
      catchError((error: unknown) => {
        console.error('Error loading survey:', error);
        if (error instanceof HttpErrorResponse) {
          if (error.status === 0) {
            this.error.set('Unable to connect to the server. Please check if the backend is running.');
          } else {
            this.error.set(error.error?.message || 'Failed to load survey');
          }
        }
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe();
  }

  loadSurveyEditions(surveyId: number): void {
    this.loading.set(true);
    
    this.surveyEditionService.getEditionsBySurveyId(surveyId).pipe(
      tap((editions: SurveyEdition[]) => {
        console.log('Loaded editions:', editions);
        if (editions) {
          this.surveyEditions.set(editions.sort((a, b) => b.year - a.year));
        } else {
          this.surveyEditions.set([]);
        }
      }),
      catchError((error: unknown) => {
        console.error('Error loading survey editions:', error);
        if (error instanceof HttpErrorResponse) {
          if (error.status === 0) {
            this.error.set('Unable to connect to the server. Please check if the backend is running.');
          } else {
            this.error.set(error.error?.message || 'Failed to load survey editions');
          }
        }
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe();
  }

  confirmDelete(): void {
    if (this.deleteModal) {
      this.modalService.open(this.deleteModal);
    }
  }

  deleteSurvey(): void {
    const currentSurvey = this.survey();
    if (currentSurvey && currentSurvey.id) {
      this.surveyService.deleteSurvey(currentSurvey.id).subscribe({
        next: () => {
          if (this.deleteModal) {
            this.modalService.dismissAll();
          }
          this.router.navigate(['/surveys']);
        },
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse) {
            this.error.set(error.error?.message || 'Failed to delete survey');
          }
          if (this.deleteModal) {
            this.modalService.dismissAll();
          }
        }
      });
    }
  }

  confirmDeleteEdition(edition: SurveyEdition): void {
    this.selectedEdition = edition;
    if (this.deleteEditionModal) {
      this.modalService.open(this.deleteEditionModal);
    }
  }

  deleteEdition(): void {
    if (this.selectedEdition?.id) {
      this.loading.set(true);
      this.surveyEditionService.deleteEdition(this.selectedEdition.id).pipe(
        tap(() => {
          const currentSurvey = this.survey();
          if (currentSurvey?.id) {
            this.loadSurveyEditions(currentSurvey.id);
          }
        }),
        catchError((error: unknown) => {
          console.error('Error deleting edition:', error);
          if (error instanceof HttpErrorResponse) {
            this.error.set(error.error?.message || 'Failed to delete edition');
          }
          return of(null);
        }),
        finalize(() => {
          this.loading.set(false);
          this.selectedEdition = null;
        })
      ).subscribe();
    }
  }

  navigateToCreateEdition(): void {
    const currentSurvey = this.survey();
    if (currentSurvey?.id) {
      this.router.navigate(['/surveys', currentSurvey.id, 'editions', 'new']);
    }
  }
}
