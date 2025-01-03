import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Question } from '../../../core/models/question.model';
import { Answer } from '../../../core/models/answer.model';
import { QuestionType } from '../../../core/models/question-type.enum';
import { QuestionService } from '../../../core/services/question.service';
import { AnswerService } from '../../../core/services/answer.service';

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
      } else {
        this.error.set('Invalid question ID');
      }
    }
  }

  loadQuestion(id: number): void {
    this.loading.set(true);
    this.questionService.getQuestionById(id).subscribe({
      next: (question) => {
        this.question.set(question);
        this.questionForm.patchValue({
          text: question.text,
          type: question.type,
          answerCount: question.answerCount
        });
        this.loadAnswers(id);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load question');
        this.loading.set(false);
      }
    });
  }

  loadAnswers(questionId: number): void {
    this.answerService.getAnswersByQuestionId(questionId).subscribe({
      next: (answers) => {
        this.answers.set(answers);
      },
      error: (err) => {
        this.error.set('Error loading answers');
      }
    });
  }

  onSubmit(): void {
    if (this.questionForm.valid && this.question()) {
      const currentQuestion = this.question();
      if (currentQuestion && currentQuestion.id) {
        const updatedQuestion: Question = {
          ...currentQuestion,
          ...this.questionForm.value
        };

        this.questionService.updateQuestion(currentQuestion.id, updatedQuestion).subscribe({
          next: (question) => {
            this.question.set(question);
            this.editing.set(false);
          },
          error: (err) => {
            this.error.set('Failed to update question');
          }
        });
      }
    }
  }

  addAnswer(): void {
    if (this.answerForm.valid && this.question()) {
      const currentQuestion = this.question();
      if (currentQuestion && currentQuestion.id) {
        const answer: Answer = {
          ...this.answerForm.value,
          questionId: currentQuestion.id
        };

        this.answerService.createAnswer(answer).subscribe({
          next: (newAnswer) => {
            this.answers.update(answers => [...answers, newAnswer]);
            this.answerForm.reset({
              text: '',
              selectionCount: 0
            });
          },
          error: (err) => {
            this.error.set('Failed to add answer');
          }
        });
      }
    }
  }

  startEditing(): void {
    this.editing.set(true);
  }

  cancelEditing(): void {
    const currentQuestion = this.question();
    if (currentQuestion) {
      this.questionForm.patchValue({
        text: currentQuestion.text,
        type: currentQuestion.type,
        answerCount: currentQuestion.answerCount
      });
    }
    this.editing.set(false);
  }
}
