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
  surveyId: number = 0;
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

    // Subscribe to year changes to check for duplicates
    this.editionForm.get('year')?.valueChanges.subscribe(year => {
      if (this.availableYears.includes(year)) {
        this.error = `Warning: An edition for year ${year} already exists.`;
      } else {
        this.error = null;
      }
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const surveyId = params['surveyId'];
      const editionId = params['editionId'];

      // Validate surveyId is a valid number
      if (surveyId && !isNaN(Number(surveyId))) {
        this.surveyId = +surveyId;
        this.loadSurveyDetails();
        this.loadAvailableYears();

        if (editionId) {
          this.isEditMode = true;
          this.loadSurveyEditionDetails(+editionId);
        }
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
        console.error(err);
      }
    });
  }

  loadSurveyEditionDetails(editionId: number): void {
    if (!editionId) return;

    this.loading = true;
    this.surveyEditionService.getEditionById(editionId).subscribe({
      next: (edition: SurveyEdition) => {
        this.surveyEdition = edition;
        this.editionForm.patchValue({
          year: edition.year,
          startDate: edition.startDate,
          creationDate: edition.creationDate
        });
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = 'Failed to load survey edition details';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadAvailableYears(): void {
    if (!this.surveyId) return;

    this.loading = true;
    this.surveyEditionService.getEditionsBySurveyId(this.surveyId).subscribe({
      next: (editions: SurveyEdition[]) => {
        const years = editions
          .map(edition => edition.year)
          .filter((year, index, self) => self.indexOf(year) === index);
        this.availableYears = years.sort((a, b) => b - a);
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Failed to load available years', err);
        this.loading = false;
      }
    });
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

  createSurveyEdition(): void {
    // Validate surveyId explicitly
    if (!this.surveyId || isNaN(this.surveyId)) {
      this.error = 'Invalid survey selected. Please choose a valid survey.';
      this.router.navigate(['/surveys']);
      return;
    }

    if (this.editionForm.valid) {
      this.loading = true;
      const editionData: Partial<SurveyEdition> = {
        ...this.editionForm.value,
        survey: this.survey && this.survey.id ? { 
          id: this.survey.id, 
          title: this.survey.title || 'Untitled Survey' 
        } : undefined // Use undefined if survey or survey.id is not available
      };

      this.surveyEditionService.createEdition(editionData).subscribe({
        next: (createdEdition) => {
          this.loading = false;
          this.router.navigate(['/survey-editions', createdEdition.id]);
        },
        error: (err) => {
          this.error = 'Failed to create survey edition';
          this.loading = false;
          console.error(err);
          this.router.navigate(['/surveys']);
        }
      });
    } else {
      this.error = 'Please fill out all required fields';
    }
  }

  onSubmit(): void {
    if (this.editionForm.invalid || !this.surveyId || !this.survey) {
      this.editionForm.markAllAsTouched();
      this.error = 'Please select a valid survey and fill out all required fields';
      return;
    }

    this.loading = true;
    const formValue = this.editionForm.value;

    const surveyEditionData: Partial<SurveyEdition> = {
      year: formValue.year,
      startDate: formValue.startDate,
      creationDate: formValue.creationDate,
      survey: this.survey && this.survey.id ? { 
        id: this.survey.id, 
        title: this.survey.title || 'Untitled Survey' 
      } : undefined // Use undefined if survey or survey.id is not available
    };

    if (this.isEditMode && this.surveyEdition?.id) {
      surveyEditionData.id = this.surveyEdition.id;
    }

    const submitAction = this.isEditMode && this.surveyEdition?.id
      ? this.surveyEditionService.updateEdition(this.surveyEdition.id, surveyEditionData)
      : this.surveyEditionService.createEdition(surveyEditionData);

    submitAction.subscribe({
      next: (savedEdition: SurveyEdition) => {
        this.loading = false;
        this.router.navigate(['/survey-editions', savedEdition.id]);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to save survey edition';
        console.error(err);
      }
    });
  }

  navigateBack(): void {
    if (this.surveyId) {
      this.router.navigate(['/surveys', this.surveyId]);
    } else {
      this.router.navigate(['/surveys']);
    }
  }
}
