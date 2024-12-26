import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Survey } from '../../core/models/survey.model';

@Component({
  selector: 'app-survey-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="surveyForm" (ngSubmit)="onSubmit()" class="p-4 bg-light rounded">
      <div class="mb-3">
        <label for="title" class="form-label">Title</label>
        <input 
          type="text" 
          class="form-control" 
          id="title" 
          formControlName="title"
          [class.is-invalid]="surveyForm.get('title')?.invalid && surveyForm.get('title')?.touched"
        >
        <div class="invalid-feedback" *ngIf="surveyForm.get('title')?.errors?.['required']">
          Title is required
        </div>
        <div class="invalid-feedback" *ngIf="surveyForm.get('title')?.errors?.['minlength']">
          Title must be at least 3 characters
        </div>
      </div>

      <div class="mb-3">
        <label for="description" class="form-label">Description</label>
        <textarea 
          class="form-control" 
          id="description" 
          formControlName="description"
          rows="3"
          [class.is-invalid]="surveyForm.get('description')?.invalid && surveyForm.get('description')?.touched"
        ></textarea>
        <div class="invalid-feedback" *ngIf="surveyForm.get('description')?.errors?.['maxlength']">
          Description must be less than 255 characters
        </div>
      </div>

      <div formGroupName="owner" class="mb-3">
        <h4>Owner Information</h4>
        <div class="mb-3">
          <label for="ownerName" class="form-label">Name</label>
          <input 
            type="text" 
            class="form-control" 
            id="ownerName" 
            formControlName="name"
            [class.is-invalid]="surveyForm.get('owner.name')?.invalid && surveyForm.get('owner.name')?.touched"
          >
          <div class="invalid-feedback" *ngIf="surveyForm.get('owner.name')?.errors?.['required']">
            Owner name is required
          </div>
          <div class="invalid-feedback" *ngIf="surveyForm.get('owner.name')?.errors?.['minlength']">
            Name must be at least 3 characters
          </div>
        </div>
      </div>

      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary" [disabled]="!surveyForm.valid">
          {{ survey ? 'Update' : 'Create' }}
        </button>
        <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancel</button>
      </div>
    </form>
  `
})
export class SurveyFormComponent {
  private fb = inject(FormBuilder);
  
  @Input() survey?: Survey;
  @Output() save = new EventEmitter<Survey>();
  @Output() cancel = new EventEmitter<void>();

  surveyForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(255)]],
    owner: this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
    })
  });

  ngOnInit() {
    if (this.survey) {
      this.surveyForm.patchValue(this.survey);
    }
  }

  onSubmit() {
    if (this.surveyForm.valid) {
      const surveyData: Survey = {
        ...this.survey,
        ...this.surveyForm.value
      };
      this.save.emit(surveyData);
    } else {
      Object.keys(this.surveyForm.controls).forEach(key => {
        const control = this.surveyForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
