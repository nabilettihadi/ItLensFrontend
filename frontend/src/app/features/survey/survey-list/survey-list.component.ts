import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Survey } from '../../../core/models/survey.model';
import { SurveyService } from '../../../core/services/survey.service';
import { SurveyFormComponent } from '../survey-form/survey-form.component';

@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [CommonModule, SurveyFormComponent],
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.css']
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
