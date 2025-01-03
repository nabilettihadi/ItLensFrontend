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
    this.surveyEditionService.getEditionsBySurveyId(this.surveyId).subscribe({
      next: (response: any) => {
        this.editions.set(response.content);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.error.set('Failed to load editions');
        console.error(error);
      }
    });
  }

  confirmDelete(editionId: number): void {
    this.selectedEditionId = editionId;
    this.deleteModal.show();
  }

  deleteEdition(): void {
    if (this.selectedEditionId) {
      this.surveyEditionService.deleteEdition(this.selectedEditionId).subscribe({
        next: () => {
          this.deleteModal.hide();
          this.loadEditions();
        },
        error: (error: Error) => {
          this.error.set('Failed to delete edition');
          console.error(error);
          this.deleteModal.hide();
        }
      });
    }
  }

  createSurveyEdition(surveyEdition: SurveyEdition): void {
    if (!this.surveyId) return;

    surveyEdition.surveyId = this.surveyId;
    this.surveyEditionService.createEdition(surveyEdition).subscribe({
      next: (edition: SurveyEdition) => {
        this.editions.update(editions => [...editions, edition]);
      },
      error: (error: Error) => {
        this.error.set('Failed to create edition');
        console.error(error);
      }
    });
  }
}
