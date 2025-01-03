import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QuestionService } from '../question.service';
import { Question } from '../../../core/models/question.model';
import { QuestionType } from '../../../core/models/question-type.model';
import { Subject } from '../../../core/models/subject.model';

@Component({
  selector: 'app-question-edit',
  templateUrl: './question-edit.component.html',
  styleUrls: ['./question-edit.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class QuestionEditComponent implements OnInit {
  questionForm: FormGroup;
  questionTypes = Object.values(QuestionType);
  loading = signal(false);
  error = signal<string | null>(null);
  questionId = signal<number | null>(null);
  subjects: Subject[] = [];

  constructor(
    private fb: FormBuilder,
    private questionService: QuestionService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.questionForm = this.fb.group({
      text: ['', Validators.required],
      type: ['', Validators.required],
      subjectId: [null, Validators.required],
      answers: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = parseInt(params['id'], 10);
      if (!isNaN(id)) {
        this.questionId.set(id);
        this.loadQuestion(id);
      } else {
        this.error.set('Invalid question ID');
        this.router.navigate(['/questions']);
      }
    });
  }

  loadQuestion(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.questionService.getQuestionById(id).subscribe({
      next: (question) => {
        if (question) {
          this.questionForm.patchValue({
            text: question.text,
            type: question.type,
            subjectId: question.subjectId
          });

          // Clear existing answers
          while (this.answers.length) {
            this.answers.removeAt(0);
          }

          // Add answers from the question
          question.answers?.forEach(answer => {
            this.answers.push(this.fb.group({
              text: [answer.text, Validators.required]
            }));
          });
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error.message || 'Error loading question');
        this.loading.set(false);
      }
    });
  }

  get answers() {
    return this.questionForm.get('answers') as FormArray;
  }

  addAnswer() {
    const answerGroup = this.fb.group({
      text: ['', Validators.required]
    });
    this.answers.push(answerGroup);
  }

  removeAnswer(index: number) {
    if (this.answers.length > 2) {
      this.answers.removeAt(index);
    } else {
      this.error.set('At least two answers are required');
    }
  }

  getAnswerError(index: number): string | null {
    const control = this.answers.at(index).get('text');
    if (control?.invalid && control?.touched) {
      if (control?.errors?.['required']) {
        return 'Answer text is required';
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.questionForm.valid && this.questionId()) {
      this.loading.set(true);
      this.error.set(null);

      const question: Question = {
        ...this.questionForm.value,
        id: this.questionId()
      };

      this.questionService.updateQuestion(question.id!, question).subscribe({
        next: () => {
          this.router.navigate(['/questions']);
        },
        error: (error) => {
          this.error.set(error.message || 'Error updating question');
          this.loading.set(false);
        }
      });
    }
  }
}
