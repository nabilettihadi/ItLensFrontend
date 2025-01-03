import { Component, OnInit, signal, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SurveyEdition } from '../../../core/models/survey-edition.model';
import { SurveyEditionService } from '../../../core/services/survey-edition.service';
import { Survey } from '../../../core/models/survey.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-survey-edition-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './survey-edition-list.component.html',
  styleUrls: ['./survey-edition-list.component.css']
})
export class SurveyEditionListComponent implements OnInit {
  private _survey = signal<Survey | undefined>(undefined);
  surveyId = computed(() => this._survey()?.id);
  
  editions = signal<SurveyEdition[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedEditionId: number | null = null;
  deleteModal: any;

  constructor(
    private route: ActivatedRoute,
    private surveyEditionService: SurveyEditionService
  ) {}

  ngOnInit(): void {
    const surveyIdParam = this.route.snapshot.paramMap.get('surveyId');
    const surveyId = surveyIdParam ? +surveyIdParam : 0;

    if (surveyId) {
      this.loadEditions(surveyId);
    }
    this.deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
  }

  loadEditions(surveyId: number): void {
    this.loading.set(true);
    this.surveyEditionService.getEditionsBySurveyId(surveyId).subscribe({
      next: (response: any) => {
        const editions = response.content || response;
        this.editions.set(editions);
        // Assuming the first edition's survey is the same for all
        this._survey.set(editions[0]?.survey);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erreur de chargement des éditions:', error);
        this.loading.set(false);
        this.error.set('Failed to load editions');
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
          this.editions.update(editions => 
            editions.filter(edition => edition.id !== this.selectedEditionId)
          );
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erreur de suppression de l\'édition:', error);
          this.error.set('Failed to delete edition');
          this.deleteModal.hide();
        }
      });
    }
  }

  createSurveyEdition(surveyEdition: SurveyEdition): void {
    const currentSurvey = this._survey();
    if (!currentSurvey) return;

    if (!surveyEdition.survey) {
      surveyEdition.survey = currentSurvey;
    } else {
      surveyEdition.survey.id = currentSurvey.id;
    }

    this.surveyEditionService.createEdition(surveyEdition).subscribe({
      next: (edition: SurveyEdition) => {
        this.editions.update(editions => [...editions, edition]);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set('Failed to create edition');
        console.error(error);
      }
    });
  }
}
