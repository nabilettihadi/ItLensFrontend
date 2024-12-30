import { Component, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SurveyEdition } from '../../../core/models/survey-edition.model';
import { SurveyEditionService } from '../../../core/services/survey-edition.service';
import { HttpErrorResponse } from '@angular/common/http';

declare var bootstrap: any;

@Component({
  selector: 'app-survey-edition-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './survey-edition-list.component.html',
  styleUrls: ['./survey-edition-list.component.css']
})
export class SurveyEditionListComponent implements OnInit {
  @Input() surveyId!: number;

  editions = signal<SurveyEdition[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedEditionId: number | null = null;
  deleteModal: any;

  constructor(private surveyEditionService: SurveyEditionService) {}

  ngOnInit(): void {
    if (this.surveyId) {
      this.loadEditions();
    }
    this.deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
  }

  loadEditions(): void {
    this.loading.set(true);
    this.surveyEditionService.getSurveyEditionsBySurveyId(this.surveyId).subscribe({
      next: (editions: SurveyEdition[]) => {
        this.editions.set(editions);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        if (error instanceof HttpErrorResponse) {
          this.error.set(error.error?.message || 'Failed to load editions');
        }
      }
    });
  }

  confirmDelete(editionId: number): void {
    this.selectedEditionId = editionId;
    this.deleteModal.show();
  }

  deleteEdition(): void {
    if (this.selectedEditionId) {
      this.surveyEditionService.deleteSurveyEdition(this.selectedEditionId).subscribe({
        next: () => {
          this.deleteModal.hide();
          this.loadEditions();
        },
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse) {
            this.error.set(error.error?.message || 'Failed to delete edition');
          }
          this.deleteModal.hide();
        }
      });
    }
  }

  createSurveyEdition(surveyEdition: SurveyEdition): void {
    if (!this.surveyId) return;

    surveyEdition.surveyId = this.surveyId;
    this.surveyEditionService.createSurveyEdition(surveyEdition).subscribe({
      next: (edition: SurveyEdition) => {
        this.editions.update(editions => [...editions, edition]);
      },
      error: (error: unknown) => {
        this.error.set('Failed to create survey edition');
        console.error('Error creating survey edition:', error);
      }
    });
  }
}
