import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Survey } from '../../../core/models/survey.model';
import { Owner } from '../../../core/models/owner.model';
import { SurveyService } from '../../../core/services/survey.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-survey-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4">
      <h2>Create New Survey</h2>
      <form [formGroup]="surveyForm" (ngSubmit)="onSubmit()">
        <div class="mb-3">
          <label for="title" class="form-label">Title</label>
          <input type="text" class="form-control" id="title" formControlName="title">
          <div *ngIf="surveyForm.get('title')?.errors?.['required'] && surveyForm.get('title')?.touched" class="text-danger">
            Title is required
          </div>
        </div>
        
        <div class="mb-3">
          <label for="description" class="form-label">Description</label>
          <textarea class="form-control" id="description" formControlName="description" rows="3"></textarea>
        </div>

        <div *ngIf="error" class="alert alert-danger">
          {{ error }}
        </div>
        
        <button type="submit" class="btn btn-primary" [disabled]="surveyForm.invalid">Create Survey</button>
      </form>
    </div>
  `,
  styles: [`
    .container { max-width: 600px; }
    .text-danger { font-size: 0.875rem; margin-top: 0.25rem; }
  `]
})
export class SurveyCreateComponent {
  surveyForm: FormGroup;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private router: Router
  ) {
    this.surveyForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', Validators.maxLength(255)]
    });
  }

  onSubmit(): void {
    if (this.surveyForm.valid) {
      const formValue = this.surveyForm.value;
      const survey: Survey = {
        title: formValue.title,
        description: formValue.description,
        owner: {
          id: 1, // Replace with actual owner ID from your auth service
          name: 'Default Owner' // Replace with actual owner name from your auth service
        }
      };
      
      console.log('Submitting survey:', survey); // Debug log
      
      this.surveyService.createSurvey(survey).subscribe({
        next: (createdSurvey) => {
          console.log('Survey created:', createdSurvey);
          this.router.navigate(['/surveys']);
        },
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse) {
            console.error('HTTP Error:', {
              status: error.status,
              statusText: error.statusText,
              error: error.error
            });
            if (error.error?.message) {
              this.error = error.error.message;
            } else if (error.status === 400) {
              this.error = 'Invalid survey data. Please check your input.';
            } else {
              this.error = 'Failed to create survey. Please try again.';
            }
          } else {
            this.error = 'An unexpected error occurred';
            console.error('Error creating survey:', error);
          }
        }
      });
    } else {
      this.error = 'Please fill in all required fields correctly.';
    }
  }
}
