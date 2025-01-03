import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AnswerService } from '../../../core/services/answer.service';
import { Answer } from '../../../core/models/answer.model';

@Component({
  selector: 'app-answer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './answer-detail.component.html',
  styleUrls: ['./answer-detail.component.css']
})
export class AnswerDetailComponent implements OnInit {
  answer = signal<Answer | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  editMode = signal(false);
  answerForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private answerService: AnswerService,
    private fb: FormBuilder
  ) {
    this.answerForm = this.fb.group({
      text: ['', Validators.required],
      selectionCount: [0, [Validators.required, Validators.min(0)]],
      percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadAnswer(id);
      }
    });
  }

  loadAnswer(id: number): void {
    this.loading.set(true);
    this.answerService.getAnswerById(id).subscribe({
      next: (answer) => {
        this.answer.set(answer);
        this.answerForm.patchValue(answer);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load answer details');
        this.loading.set(false);
      }
    });
  }

  toggleEditMode(): void {
    this.editMode.update(mode => !mode);
  }

  updateAnswer(): void {
    const answerId = this.answer()?.id;
    if (this.answerForm.valid && answerId) {
      this.loading.set(true);
      this.answerService.updateAnswer(answerId, this.answerForm.value).subscribe({
        next: (updatedAnswer) => {
          this.answer.set(updatedAnswer);
          this.editMode.set(false);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Erreur lors de la mise à jour de la réponse');
          this.loading.set(false);
        }
      });
    }
  }
}
