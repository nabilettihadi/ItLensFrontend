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
  editionForm!: FormGroup;
  surveyId: number | null = null;
  survey: Survey | null = null;
  surveyEdition: SurveyEdition | null = null;
  error: string | null = null;
  loading = false;
  isEditMode = false;
  availableYears: number[] = [];
  selectedYear: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private surveyEditionService: SurveyEditionService,
    private surveyService: SurveyService
  ) {
    this.initForm();
  }

  initForm() {
    const currentYear = new Date().getFullYear();
    this.editionForm = this.fb.group({
      year: [currentYear, [Validators.required, Validators.min(2000), Validators.max(2100)]],
      startDate: [new Date().toISOString().split('T')[0], Validators.required],
      creationDate: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const surveyId = params['surveyId'];
      const editionId = params['editionId'];

      if (surveyId) {
        this.surveyId = +surveyId;
        this.loadSurveyDetails();
        this.loadAvailableYears();

        // Check if we're in edit mode
        if (editionId) {
          this.isEditMode = true;
          this.loadSurveyEditionDetails(+editionId);
        }
      } else {
        this.error = 'Survey ID not found';
        this.router.navigate(['/surveys']);
      }
    });
  }

  loadSurveyDetails() {
    if (this.surveyId) {
      this.surveyService.getSurveyById(this.surveyId).subscribe({
        next: (survey) => {
          this.survey = survey;
        },
        error: (err) => {
          this.error = 'Failed to load survey details';
          console.error(err);
        }
      });
    }
  }

  loadSurveyEditionDetails(editionId: number) {
    this.surveyEditionService.getSurveyEditionById(editionId).subscribe({
      next: (edition) => {
        this.surveyEdition = edition;
        this.editionForm.patchValue({
          year: edition.year,
          startDate: edition.startDate,
          creationDate: edition.creationDate
        });
      },
      error: (err) => {
        this.error = 'Failed to load survey edition details';
        console.error(err);
      }
    });
  }

  loadAvailableYears() {
    if (this.surveyId) {
      this.surveyEditionService.getSurveyEditionYears(this.surveyId).subscribe({
        next: (years) => {
          this.availableYears = years.sort((a, b) => b - a);
        },
        error: (err) => {
          console.error('Failed to load available years', err);
        }
      });
    }
  }

  onSubmit() {
    if (this.editionForm.invalid) {
      this.editionForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.editionForm.value;

    const surveyEditionData: SurveyEdition = {
      surveyId: this.surveyId!,
      year: formValue.year,
      startDate: new Date(formValue.startDate),
      creationDate: new Date(formValue.creationDate)
    };

    const submitAction = this.isEditMode && this.surveyEdition?.id
      ? this.surveyEditionService.updateSurveyEdition(this.surveyEdition.id, surveyEditionData)
      : this.surveyEditionService.createSurveyEdition(surveyEditionData);

    submitAction.subscribe({
      next: (savedEdition) => {
        this.loading = false;
        // Navigate to survey edition details
        this.router.navigate(['/survey-editions', savedEdition.id]);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to save survey edition';
        console.error(err);
      }
    });
  }

  navigateToSurveyEditionDetails() {
    if (this.surveyId) {
      this.router.navigate(['/survey', this.surveyId, 'editions']);
    } else {
      this.router.navigate(['/surveys']);
    }
  }

  onYearClick(event: Event): void {
    // Type-safe event handling
    const inputElement = event.target as HTMLInputElement;
    const year = inputElement.valueAsNumber;

    // Check if year is valid and surveyId exists
    if (!isNaN(year) && this.surveyId) {
      this.surveyEditionService.getSurveyEditionByYear(this.surveyId, year).subscribe({
        next: (edition) => {
          // Navigate to the specific survey edition details
          this.router.navigate(['/survey-editions', edition.id]);
        },
        error: (err) => {
          // If no edition found, navigate to create a new edition for this year
          this.router.navigate(['/survey', this.surveyId, 'editions', 'new'], {
            queryParams: { year: year }
          });
        }
      });
    }
  }
}