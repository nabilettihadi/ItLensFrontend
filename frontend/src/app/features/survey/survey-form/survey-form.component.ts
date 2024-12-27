import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Survey } from '../../../core/models/survey.model';

@Component({
  selector: 'app-survey-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './survey-form.component.html',
  styleUrls: ['./survey-form.component.css']
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
