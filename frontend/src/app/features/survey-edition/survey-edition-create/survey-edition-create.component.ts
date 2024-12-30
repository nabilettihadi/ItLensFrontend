import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyEdition } from '../../../core/models/survey-edition.model';
import { SurveyEditionService } from '../../../core/services/survey-edition.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SurveyService } from '../../../core/services/survey.service';
import { Survey } from '../../../core/models/survey.model';

@Component({
  selector: 'app-survey-edition-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './survey-edition-create.component.html',
  styleUrls: ['./survey-edition-create.component.css']
})
export class SurveyEditionCreateComponent implements OnInit {
  editionForm: FormGroup;
  surveyId: number | null = null;
  survey: Survey | null = null;
  error: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private surveyEditionService: SurveyEditionService,
    private surveyService: SurveyService
  ) {
    const currentYear = new Date().getFullYear();
    this.editionForm = this.fb.group({
      year: [currentYear, [Validators.required, Validators.min(2000), Validators.max(2100)]],
      startDate: [new Date().toISOString().split('T')[0], Validators.required],
      creationDate: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['surveyId'];
      if (id) {
        this.surveyId = +id;
        this.loadSurveyDetails();
      } else {
        this.error = 'Survey ID not found';
        this.router.navigate(['/surveys']);
      }
    });
  }

  loadSurveyDetails(): void {
    if (this.surveyId) {
      this.surveyService.getById(this.surveyId).subscribe({
        next: (survey) => {
          this.survey = survey;
        },
        error: (error) => {
          console.error('Error loading survey details:', error);
          this.error = 'Failed to load survey details';
          this.router.navigate(['/surveys']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.editionForm.valid && this.surveyId) {
      this.loading = true;
      this.error = null;

      const formValue = this.editionForm.value;
      const edition: SurveyEdition = {
        year: formValue.year,
        startDate: new Date(formValue.startDate),
        creationDate: new Date(formValue.creationDate),
        surveyId: this.surveyId
      };

      this.surveyEditionService.createSurveyEdition(edition).subscribe({
        next: (response) => {
          console.log('Edition created:', response);
          this.router.navigate(['/surveys', this.surveyId]);
        },
        error: (error: unknown) => {
          this.loading = false;
          if (error instanceof HttpErrorResponse) {
            console.error('Error creating edition:', error);
            this.error = error.error?.message || 'Failed to create edition';
          }
        }
      });
    }
  }

  cancel(): void {
    if (this.surveyId) {
      this.router.navigate(['/surveys', this.surveyId]);
    } else {
      this.router.navigate(['/surveys']);
    }
  }
}