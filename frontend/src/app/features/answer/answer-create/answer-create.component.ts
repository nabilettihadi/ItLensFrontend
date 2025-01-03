import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnswerService } from '../../../core/services/answer.service';
import { Answer } from '../../../core/models/answer.model';

@Component({
  selector: 'app-answer-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './answer-create.component.html',
  styleUrls: ['./answer-create.component.css']
})
export class AnswerCreateComponent implements OnInit {
  answerForm: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private answerService: AnswerService, private fb: FormBuilder) {
    this.answerForm = this.fb.group({
      text: ['', Validators.required],
      selectionCount: [0, [Validators.required, Validators.min(0)]],
      percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {}

  createAnswer(): void {
    if (this.answerForm.valid) {
      this.loading.set(true);
      const newAnswer: Answer = this.answerForm.value;
      this.answerService.createAnswer(newAnswer).subscribe({
        next: () => {
          this.answerForm.reset({ selectionCount: 0, percentage: 0 });
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Error creating answer');
          this.loading.set(false);
        }
      });
    }
  }
}
