import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Survey } from '../../../core/models/survey.model';

@Component({
  selector: 'app-survey-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './survey-form.component.html',
  styleUrls: ['./survey-form.component.css']
})
export class SurveyFormComponent {
  @Input() survey?: Survey;
  @Output() save = new EventEmitter<Survey>();
  @Output() cancel = new EventEmitter<void>();

  surveyForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.surveyForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(255)]],
      owner: this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
      })
    });
  }

  ngOnInit(): void {
    if (this.survey) {
      this.surveyForm.patchValue(this.survey);
    }
  }

  onSubmit(): void {
    if (this.surveyForm.valid) {
      const surveyData: Survey = {
        ...this.survey,
        ...this.surveyForm.value
      };
      this.save.emit(surveyData);
    } else {
      Object.keys(this.surveyForm.controls).forEach((key: string) => {
        const control = this.surveyForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
