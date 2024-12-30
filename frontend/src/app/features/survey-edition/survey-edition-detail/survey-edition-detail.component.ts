import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SurveyEdition } from '../../../core/models/survey-edition.model';
import { SurveyEditionService } from '../../../core/services/survey-edition.service';
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
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveyEditionService: SurveyEditionService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const editionId = params['id'];
      if (editionId) {
        this.loadEdition(+editionId);
      }
    });
  }

  loadEdition(editionId: number): void {
    this.loading.set(true);
    this.surveyEditionService.getSurveyEditionById(editionId).subscribe({
      next: (edition: SurveyEdition) => {
        this.edition.set(edition);
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

  deleteEdition(): void {
    const currentEdition = this.edition();
    if (currentEdition && currentEdition.id) {
      this.surveyEditionService.deleteSurveyEdition(currentEdition.id).subscribe({
        next: () => {
          this.router.navigate(['/surveys', currentEdition.surveyId]);
        },
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse) {
            this.error.set(error.error?.message || 'Failed to delete survey edition');
          }
        }
      });
    }
  }
}
