import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Question } from '../../../core/models/question.model';
import { Answer } from '../../../core/models/answer.model';
import { QuestionType } from '../../../core/models/question-type.enum';
import { QuestionService } from '../../../core/services/question.service';
import { AnswerService } from '../../../core/services/answer.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './question-detail.component.html',
  styleUrls: ['./question-detail.component.css']
})
export class QuestionDetailComponent implements OnInit {
  question = signal<Question | null>(null);
  answers = signal<Answer[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  editing = signal(false);
  questionTypes = Object.values(QuestionType);

  questionForm: FormGroup;
  answerForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private answerService: AnswerService,
    private fb: FormBuilder
  ) {
    this.questionForm = this.fb.group({
      text: ['', Validators.required],
      type: [QuestionType.SINGLE_CHOICE, Validators.required],
      answerCount: [0, [Validators.required, Validators.min(0)]]
    });

    this.answerForm = this.fb.group({
      text: ['', Validators.required],
      selectionCount: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      const questionId = parseInt(id, 10);
      if (!isNaN(questionId)) {
        this.loadQuestion(questionId);
        this.loadAnswers(questionId);
      }
    }
  }

  private loadQuestion(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.questionService.getQuestionById(id).subscribe({
      next: (question: Question) => {
        this.question.set(question);
        this.questionForm.patchValue({
          text: question.text,
          type: question.type,
          answerCount: question.answerCount
        });
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Failed to load question: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  private loadAnswers(questionId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.answerService.getAnswersByQuestionId(questionId).subscribe({
      next: (answers: Answer[]) => {
        this.answers.set(answers);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Failed to load answers: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.questionForm.valid && this.question()) {
      const currentQuestion = this.question()!;
      if (!currentQuestion.id) {
        this.error.set('Question ID is missing');
        return;
      }

      const updatedQuestion: Question = {
        ...currentQuestion,
        ...this.questionForm.value
      };

      this.loading.set(true);
      this.error.set(null);

      this.questionService.updateQuestion(currentQuestion.id, updatedQuestion).subscribe({
        next: (question: Question) => {
          this.question.set(question);
          this.editing.set(false);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set('Failed to update question: ' + err.message);
          this.loading.set(false);
        }
      });
    }
  }

  onAnswerSubmit(): void {
    if (this.answerForm.valid && this.question()) {
      const newAnswer: Answer = {
        ...this.answerForm.value,
        questionId: this.question()!.id
      };

      this.loading.set(true);
      this.error.set(null);

      this.answerService.createAnswer(newAnswer).subscribe({
        next: (answer: Answer) => {
          this.answers.update(answers => [...answers, answer]);
          this.answerForm.reset({
            text: '',
            selectionCount: 0
          });
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set('Failed to create answer: ' + err.message);
          this.loading.set(false);
        }
      });
    }
  }

  onDeleteAnswer(answerId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.answerService.deleteAnswer(answerId).subscribe({
      next: () => {
        this.answers.update(answers => answers.filter(a => a.id !== answerId));
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Failed to delete answer: ' + err.message);
        this.loading.set(false);
      }
    });
  }
}
