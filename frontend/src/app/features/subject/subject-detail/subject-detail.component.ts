import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SubjectService } from '../../../core/services/subject.service';
import { QuestionService } from '../../../core/services/question.service';
import { Subject } from '../../../core/models/subject.model';
import { Question } from '../../../core/models/question.model';

@Component({
  selector: 'app-subject-detail',
  templateUrl: './subject-detail.component.html',
  styleUrls: ['./subject-detail.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule]
})
export class SubjectDetailComponent implements OnInit {
  subject: Subject | null = null;
  questions: Question[] = [];
  children: Subject[] = [];
  loading = false;
  error: string | null = null;
  editing = false;
  subjectForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private subjectService: SubjectService,
    private questionService: QuestionService,
    private route: ActivatedRoute
  ) {
    this.subjectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadSubject(+params['id']);
      }
    });
  }

  loadSubject(id: number): void {
    this.loading = true;
    this.error = null;

    this.subjectService.getSubjectById(id).subscribe({
      next: (subject: Subject) => {
        this.subject = subject;
        this.subjectForm.patchValue({
          title: subject.title
        });
        this.loadChildren(id);
        this.loadQuestions(id);
        this.loading = false;
      },
      error: (error: any) => {
        this.error = error.message || 'Error loading subject';
        this.loading = false;
      }
    });
  }

  loadChildren(id: number): void {
    this.subjectService.getChildSubjects(id).subscribe({
      next: (children: Subject[]) => {
        this.children = children;
      },
      error: (error: any) => {
        this.error = error.message || 'Error loading child subjects';
      }
    });
  }

  loadQuestions(id: number): void {
    this.questionService.getQuestionsBySubjectId(id).subscribe({
      next: (response: any) => {
        this.questions = response.content;
      },
      error: (error: any) => {
        this.error = error.message || 'Error loading questions';
      }
    });
  }

  startEditing(): void {
    this.editing = true;
  }

  cancelEditing(): void {
    this.editing = false;
    if (this.subject) {
      this.subjectForm.patchValue({
        title: this.subject.title
      });
    }
  }

  saveSubject(): void {
    if (this.subjectForm.valid && this.subject) {
      this.loading = true;
      this.error = null;

      const updatedSubject: Subject = {
        ...this.subject,
        ...this.subjectForm.value
      };

      this.subjectService.updateSubject(this.subject.id!, updatedSubject).subscribe({
        next: (subject: Subject) => {
          this.subject = subject;
          this.editing = false;
          this.loading = false;
        },
        error: (error: any) => {
          this.error = error.message || 'Error updating subject';
          this.loading = false;
        }
      });
    } else {
      this.error = 'Please fill in the form correctly';
    }
  }
}
