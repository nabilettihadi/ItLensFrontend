import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SurveyEdition } from '../../../core/models/survey-edition.model';

@Component({
  selector: 'app-survey-edition-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './survey-edition-form.component.html',
  styleUrls: ['./survey-edition-form.component.css']
})
export class SurveyEditionFormComponent {
  @Input() surveyId?: number;
  @Output() save = new EventEmitter<SurveyEdition>();
  @Output() cancel = new EventEmitter<void>();

  surveyEditionForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.surveyEditionForm = this.fb.group({
      year: ['', [Validators.required, Validators.min(1900), Validators.max(2100)]],
      creationDate: ['', Validators.required],
      startDate: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.surveyEditionForm.valid) {
      const surveyEditionData: SurveyEdition = {
        ...this.surveyEditionForm.value,
        surveyId: this.surveyId
      };

      this.save.emit(surveyEditionData);
    } else {
      Object.keys(this.surveyEditionForm.controls).forEach((key: string) => {
        const control = this.surveyEditionForm.get(key);
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
