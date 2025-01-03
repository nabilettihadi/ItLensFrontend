import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
  editionForm!: FormGroup;
  surveyId: number = 0;
  survey: Survey | null = null;
  error: string | null = null;
  loading = false;
  today = this.formatDate(new Date());

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private surveyEditionService: SurveyEditionService,
    private surveyService: SurveyService
  ) {
    this.initForm();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private dateValidator(control: AbstractControl): ValidationErrors | null {
    const selectedDate = new Date(control.value);
    const today = new Date(this.today);
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return { pastDate: true };
    }
    return null;
  }

  initForm() {
    const currentYear = new Date().getFullYear();
    
    this.editionForm = this.fb.group({
      year: [currentYear, [Validators.required, Validators.min(2000), Validators.max(2100)]],
      startDate: [this.today, [Validators.required, (control: AbstractControl) => this.dateValidator(control)]],
      creationDate: [this.today, [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Get surveyId from route parameters
    this.route.params.subscribe(params => {
      const surveyId = params['surveyId'];
      if (surveyId && !isNaN(Number(surveyId))) {
        this.surveyId = +surveyId;
        this.loadSurveyDetails();
      } else {
        this.error = 'Invalid survey ID';
        this.router.navigate(['/surveys']);
      }
    });
  }

  loadSurveyDetails() {
    if (!this.surveyId) return;

    this.loading = true;
    this.surveyService.getSurveyById(this.surveyId).subscribe({
      next: (survey) => {
        this.survey = survey;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load survey details';
        this.loading = false;
        console.error('Error loading survey:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.editionForm.invalid || !this.surveyId) {
      this.editionForm.markAllAsTouched();
      if (this.editionForm.get('startDate')?.errors?.['pastDate']) {
        this.error = 'Start date must be in present or future';
      } else {
        this.error = 'Please fill out all required fields';
      }
      return;
    }

    this.loading = true;
    this.error = null;
    const formValue = this.editionForm.value;

    // Prepare the request payload with dates in YYYY-MM-DD format
    const surveyEditionData = {
      year: formValue.year,
      startDate: formValue.startDate,
      creationDate: this.today, // Always use today for creation date
      surveyId: this.surveyId
    };

    console.log('Submitting survey edition:', surveyEditionData);

    this.surveyEditionService.createEdition(surveyEditionData).subscribe({
      next: (response) => {
        console.log('Survey edition created:', response);
        this.loading = false;
        this.router.navigate(['/survey', this.surveyId, 'editions']);
      },
      error: (err: Error | HttpErrorResponse) => {
        this.loading = false;
        if (err instanceof HttpErrorResponse) {
          if (err.error?.startDate) {
            this.error = err.error.startDate;
          } else if (err.error?.message) {
            this.error = err.error.message;
          } else if (typeof err.error === 'string') {
            this.error = err.error;
          } else {
            this.error = 'Failed to create survey edition';
          }
        } else {
          this.error = err.message || 'An unexpected error occurred';
        }
        console.error('Error creating survey edition:', err);
      }
    });
  }

  navigateBack(): void {
    this.router.navigate(['/survey', this.surveyId, 'editions']);
  }

  incrementYear(increment: number): void {
    const yearControl = this.editionForm.get('year');
    if (yearControl) {
      const currentYear = yearControl.value || new Date().getFullYear();
      const newYear = currentYear + increment;
      if (newYear >= 2000 && newYear <= 2100) {
        yearControl.setValue(newYear);
      }
    }
  }
}
