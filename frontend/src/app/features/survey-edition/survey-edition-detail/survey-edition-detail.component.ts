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
    this.surveyEditionService.getSurveyEditionByYearAndSurveyId(surveyId, year).subscribe({
      next: (edition) => {
        this.edition.set(edition);
        this.surveyService.getSurveyById(surveyId).subscribe({
          next: (survey) => {
            this.survey.set(survey);
            this.loading.set(false);
          },
          error: (error) => {
            this.error.set('Failed to load survey details');
            this.loading.set(false);
            console.error(error);
          }
        });
      },
      error: (error) => {
        this.error.set(`Failed to load survey edition for year ${year}`);
        this.loading.set(false);
        console.error(error);
      }
    });
  }

  loadEdition(editionId: number): void {
    this.loading.set(true);
    this.surveyEditionService.getSurveyEditionById(editionId).subscribe({
      next: (edition: SurveyEdition) => {
        this.edition.set(edition);
        // Charger les informations du survey
        this.surveyService.getSurveyById(edition.surveyId).subscribe({
          next: (survey) => {
            this.survey.set(survey);
          },
          error: (error) => {
            console.error('Failed to load survey', error);
          }
        });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        if (error instanceof HttpErrorResponse) {
          this.error.set(error.error?.message || 'Failed to load survey edition');
        }
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
    const currentEdition = this.edition();
    if (currentEdition && currentEdition.id) {
      this.surveyEditionService.deleteSurveyEdition(currentEdition.id).subscribe({
        next: () => {
          this.router.navigate(['/surveys', currentEdition.surveyId]);
        },
        error: (error) => {
          this.error.set('Failed to delete survey edition');
          console.error(error);
        }
      });
    }
  }
}
