import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { SubjectService } from '../../../core/services/subject.service';
import { Subject } from '../../../core/models/subject.model';

@Component({
  selector: 'app-subject-edit',
  templateUrl: './subject-edit.component.html',
  styleUrls: ['./subject-edit.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class SubjectEditComponent implements OnInit {
  subjectForm: FormGroup;
  loading: boolean = false;
  error: string | null = null;
  subjectId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private subjectService: SubjectService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.subjectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.subjectId = +params['id'];
        this.loadSubject();
      }
    });
  }

  loadSubject(): void {
    if (this.subjectId) {
      this.loading = true;
      this.error = null;

      this.subjectService.getSubjectById(this.subjectId).subscribe({
        next: (subject: Subject) => {
          this.subjectForm.patchValue({
            title: subject.title
          });
          this.loading = false;
        },
        error: (error: any) => {
          this.error = error.message || 'Error loading subject';
          this.loading = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.subjectForm.valid && this.subjectId) {
      this.loading = true;
      this.error = null;

      const updatedSubject: Subject = {
        id: this.subjectId,
        ...this.subjectForm.value,
        surveyEditionId: 1 // You might want to get this from somewhere else
      };

      this.subjectService.updateSubject(this.subjectId, updatedSubject).subscribe({
        next: () => {
          this.router.navigate(['/subjects']);
        },
        error: (error: any) => {
          this.error = error.message || 'Error updating subject';
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/subjects']);
  }
}
