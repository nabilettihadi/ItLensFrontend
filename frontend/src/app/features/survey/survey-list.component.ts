import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Survey } from '../../core/models/survey.model';
import { SurveyService } from '../../core/services/survey.service';
import { SurveyFormComponent } from './survey-form.component';

@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [CommonModule, SurveyFormComponent],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Surveys</h2>
        <button class="btn btn-primary" (click)="showForm = true" *ngIf="!showForm">
          Create New Survey
        </button>
      </div>

      <app-survey-form
        *ngIf="showForm"
        (save)="onSaveSurvey($event)"
        (cancel)="showForm = false"
      ></app-survey-form>

      <div class="row">
        <div class="col-md-6 col-lg-4 mb-4" *ngFor="let survey of surveys">
          <div class="card h-100 shadow-sm hover-card">
            <div class="card-body">
              <h5 class="card-title fw-bold">{{ survey.title }}</h5>
              <p class="card-text text-muted">{{ survey.description }}</p>
              <div class="mb-3">
                <i class="bi bi-person-fill"></i>
                <span class="ms-2">{{ survey.owner.name }}</span>
              </div>
              <div *ngIf="survey.editions && survey.editions.length > 0">
                <strong class="d-block mb-2">Editions:</strong>
                <div class="editions-container">
                  <div 
                    *ngFor="let edition of survey.editions" 
                    class="edition-badge"
                    (click)="edition.id && navigateToEdition(edition.id)"
                    role="button"
                  >
                    {{ edition.year }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <style>
      .hover-card {
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .hover-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
      }
      .editions-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .edition-badge {
        background-color: #e9ecef;
        color: #495057;
        padding: 6px 12px;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      .edition-badge:hover {
        background-color: #007bff;
        color: white;
      }
    </style>
  `,
  styles: []
})
export class SurveyListComponent implements OnInit {
  private surveyService = inject(SurveyService);
  
  surveys: Survey[] = [];
  showForm = false;

  ngOnInit() {
    this.loadSurveys();
  }

  loadSurveys() {
    this.surveyService.getSurveys().subscribe({
      next: (response) => {
        this.surveys = response.content;
      },
      error: (error) => {
        console.error('Error loading surveys:', error);
      }
    });
  }

  onSaveSurvey(survey: Survey) {
    this.surveyService.createSurvey(survey).subscribe({
      next: () => {
        this.showForm = false;
        this.loadSurveys();
      },
      error: (error) => {
        console.error('Error creating survey:', error);
      }
    });
  }

  navigateToEdition(editionId: number) {
    // TODO: Implement navigation to edition detail page
    console.log('Navigating to edition:', editionId);
  }
}
