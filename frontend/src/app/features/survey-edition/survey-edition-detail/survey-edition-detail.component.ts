import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SurveyEdition } from '../../../core/models/survey-edition.model';
import { SurveyEditionService } from '../../../core/services/survey-edition.service';
import { SurveyService } from '../../../core/services/survey.service';
import { Survey } from '../../../core/models/survey.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-survey-edition-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './survey-edition-detail.component.html',
  styleUrls: ['./survey-edition-detail.component.css']
})
export class SurveyEditionDetailComponent implements OnInit {
  edition = signal<SurveyEdition | null>(null);
  survey = signal<Survey | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveyEditionService: SurveyEditionService,
    private surveyService: SurveyService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const surveyId = +params['surveyId'];
      const year = +params['year'];
      
      if (surveyId && year) {
        this.loadEditionByYearAndSurveyId(surveyId, year);
      } else if (params['editionId']) {
        this.loadEdition(+params['editionId']);
      }
    });
  }

  loadEditionByYearAndSurveyId(surveyId: number, year: number): void {
    this.loading.set(true);
    this.surveyEditionService.getEditionsBySurveyId(surveyId).subscribe({
      next: (editions: SurveyEdition[]) => {
        const edition = editions.find((e: SurveyEdition) => e.year === year);
        if (edition) {
          this.edition.set(edition);
          this.surveyService.getSurveyById(surveyId).subscribe({
            next: (survey: Survey) => {
              this.survey.set(survey);
              this.loading.set(false);
            },
            error: (err: Error) => {
              this.error.set('Failed to load survey details');
              this.loading.set(false);
              console.error(err);
            }
          });
        } else {
          this.error.set('Edition not found');
          this.loading.set(false);
        }
      },
      error: (err: Error) => {
        this.error.set('Failed to load edition details');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  loadEdition(editionId: number): void {
    this.loading.set(true);
    this.surveyEditionService.getEditionById(editionId).subscribe({
      next: (edition: SurveyEdition) => {
        this.edition.set(edition);
        if (edition.surveyId) {
          this.surveyService.getSurveyById(edition.surveyId).subscribe({
            next: (survey) => {
              this.survey.set(survey);
              this.loading.set(false);
            },
            error: (err: Error) => {
              this.error.set('Failed to load survey details');
              this.loading.set(false);
              console.error(err);
            }
          });
        }
      },
      error: (err: Error) => {
        this.error.set('Failed to load edition details');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  editEdition(): void {
    const currentEdition = this.edition();
    if (currentEdition && currentEdition.id) {
      this.router.navigate([
        '/surveys', 
        currentEdition.surveyId, 
        'editions', 
        currentEdition.id, 
        'edit'
      ]);
    }
  }

  goBack(): void {
    const currentEdition = this.edition();
    if (currentEdition) {
      this.router.navigate(['/surveys', currentEdition.surveyId]);
    } else {
      this.router.navigate(['/surveys']);
    }
  }

  deleteEdition(): void {
    if (this.edition()) {
      if (confirm('Are you sure you want to delete this edition?')) {
        this.loading.set(true);
        this.surveyEditionService.deleteEdition(this.edition()!.id!).subscribe({
          next: () => {
            this.loading.set(false);
            this.router.navigate(['/surveys', this.survey()?.id]);
          },
          error: (err: Error) => {
            this.error.set('Failed to delete edition');
            this.loading.set(false);
            console.error(err);
          }
        });
      }
    }
  }
}
