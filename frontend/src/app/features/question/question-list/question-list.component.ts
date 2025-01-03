import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Question } from '../../../core/models/question.model';
import { QuestionType } from '../../../core/models/question-type.enum';
import { QuestionService } from '../../../core/services/question.service';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.css']
})
export class QuestionListComponent implements OnInit {
  questions = signal<Question[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(0);
  pageSize = signal(10);
  totalElements = signal(0);
  questionTypes = Object.values(QuestionType);

  questionForm: FormGroup;

  constructor(
    private questionService: QuestionService,
    private fb: FormBuilder
  ) {
    this.questionForm = this.fb.group({
      text: ['', Validators.required],
      type: [QuestionType.SINGLE_CHOICE, Validators.required],
      answerCount: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(page: number = 0): void {
    this.loading.set(true);
    this.questionService.getAllQuestions(page, this.pageSize())
      .subscribe({
        next: (response) => {
          this.questions.set(response.content);
          this.totalElements.set(response.totalElements);
          this.currentPage.set(page);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Error loading questions');
          this.loading.set(false);
        }
      });
  }

  onPageChange(page: number): void {
    this.loadQuestions(page);
  }

  createQuestion(): void {
    if (this.questionForm.valid) {
      this.loading.set(true);
      this.questionService.createQuestion(this.questionForm.value)
        .subscribe({
          next: () => {
            this.loadQuestions();
            this.questionForm.reset({
              type: QuestionType.SINGLE_CHOICE,
              answerCount: 0
            });
          },
          error: (err) => {
            this.error.set('Error creating question');
            this.loading.set(false);
          }
        });
    }
  }

  deleteQuestion(id: number): void {
    if (confirm('Are you sure you want to delete this question?')) {
      this.loading.set(true);
      this.questionService.deleteQuestion(id)
        .subscribe({
          next: () => {
            this.loadQuestions();
          },
          error: (err) => {
            this.error.set('Error deleting question');
            this.loading.set(false);
          }
        });
    }
  }
}
