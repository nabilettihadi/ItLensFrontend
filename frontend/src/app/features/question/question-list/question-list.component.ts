import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { QuestionService } from '../question.service';
import { Question } from '../../../core/models/question.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class QuestionListComponent implements OnInit {
  questions$: Observable<Question[]>;
  loading: boolean = false;
  error: string | null = null;

  constructor(private questionService: QuestionService) {
    this.questions$ = this.questionService.getQuestions();
  }

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.loading = true;
    this.error = null;
    this.questions$ = this.questionService.getQuestions();
    this.loading = false;
  }

  deleteQuestion(id: number): void {
    if (confirm('Are you sure you want to delete this question?')) {
      this.loading = true;
      this.error = null;

      this.questionService.deleteQuestion(id).subscribe({
        next: () => {
          this.loadQuestions();
        },
        error: (error: any) => {
          this.error = error.message || 'Error deleting question';
          this.loading = false;
        }
      });
    }
  }
}
