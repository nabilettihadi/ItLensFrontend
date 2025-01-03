import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnswerService } from '../../../core/services/answer.service';
import { Answer } from '../../../core/models/answer.model';
import { Page } from '../../../core/models/page.model';

@Component({
  selector: 'app-answer-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './answer-list.component.html',
  styleUrls: ['./answer-list.component.css']
})
export class AnswerListComponent implements OnInit {
  answers = signal<Answer[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(0);
  pageSize = signal(10);
  totalElements = signal(0);

  constructor(private answerService: AnswerService) {}

  ngOnInit(): void {
    this.loadAnswers();
  }

  loadAnswers(page: number = 0): void {
    this.loading.set(true);
    this.answerService.getAllAnswers(page, this.pageSize()).subscribe({
      next: (response: Page<Answer>) => {
        this.answers.set(response.content);
        this.currentPage.set(response.number);
        this.totalElements.set(response.totalElements);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error loading answers');
        this.loading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.loadAnswers(page);
  }
}
