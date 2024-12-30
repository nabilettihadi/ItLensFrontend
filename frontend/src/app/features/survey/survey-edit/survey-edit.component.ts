import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Survey } from '../../../core/models/survey.model';
import { SurveyService } from '../../../core/services/survey.service';

@Component({
  selector: 'app-survey-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './survey-edit.component.html',
  styleUrls: ['./survey-edit.component.css']
})
export class SurveyEditComponent implements OnInit {
  surveyForm: FormGroup;
  survey = signal<Survey | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private surveyService: SurveyService
  ) {
    this.surveyForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    const surveyId = this.route.snapshot.paramMap.get('id');
    
    if (surveyId) {
      this.loadSurveyDetails(+surveyId);
    } else {
      this.error.set('No survey ID provided');
      this.loading.set(false);
    }
  }

  loadSurveyDetails(surveyId: number): void {
    this.surveyService.getSurveyById(surveyId).subscribe({
      next: (survey) => {
        this.survey.set(survey);
        this.surveyForm.patchValue({
          title: survey.title,
          description: survey.description
        });
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set('Failed to load survey details');
        this.loading.set(false);
        console.error('Error loading survey details:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.surveyForm.valid && this.survey()) {
      const updatedSurvey: Survey = {
        ...this.survey()!,
        ...this.surveyForm.value
      };

      this.surveyService.updateSurvey(updatedSurvey.id!, updatedSurvey).subscribe({
        next: () => {
          this.router.navigate(['/surveys', updatedSurvey.id]);
        },
        error: (err: unknown) => {
          this.error.set('Failed to update survey');
          console.error('Error updating survey:', err);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/surveys', this.survey()?.id]);
  }
}
