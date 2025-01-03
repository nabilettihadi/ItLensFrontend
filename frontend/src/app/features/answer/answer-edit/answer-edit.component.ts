import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AnswerService } from '../answer.service';
import { QuestionService } from '../../question/question.service';
import { Answer } from '../../../core/models/answer.model';
import { Question } from '../../../core/models/question.model';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-answer-edit',
  templateUrl: './answer-edit.component.html',
  styleUrls: ['./answer-edit.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class AnswerEditComponent implements OnInit {
  answerForm: FormGroup;
  questions$: Observable<Question[]>;
  loading = signal(false);
  error = signal<string | null>(null);
  answerId = signal<number | null>(null);

  constructor(
    private fb: FormBuilder,
    private answerService: AnswerService,
    private questionService: QuestionService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.answerForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(3)]],
      questionId: ['', Validators.required]
    });

    this.questions$ = this.questionService.getQuestions();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = parseInt(params['id'], 10);
      if (!isNaN(id)) {
        this.answerId.set(id);
        this.loadAnswer(id);
      } else {
        this.error.set('Invalid answer ID');
        this.router.navigate(['/answers']);
      }
    });
  }

  loadAnswer(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.answerService.getAnswerById(id).subscribe({
      next: (answer: Answer) => {
        if (answer) {
          this.answerForm.patchValue({
            text: answer.text,
            questionId: answer.questionId
          });
        }
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(error.message || 'Error loading answer');
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.answerForm.valid && this.answerId()) {
      this.loading.set(true);
      this.error.set(null);

      const answer: Answer = {
        ...this.answerForm.value,
        id: this.answerId()
      };

      this.answerService.updateAnswer(answer.id!, answer).subscribe({
        next: () => {
          this.router.navigate(['/answers']);
        },
        error: (error: HttpErrorResponse) => {
          this.error.set(error.message || 'Error updating answer');
          this.loading.set(false);
        }
      });
    }
  }
}
