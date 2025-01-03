import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from '../../../core/models/subject.model';
import { SubjectService } from '../../../core/services/subject.service';

@Component({
  selector: 'app-subject-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './subject-list.component.html',
  styleUrls: ['./subject-list.component.css']
})
export class SubjectListComponent implements OnInit {
  subjects = signal<Subject[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(0);
  pageSize = signal(10);
  totalElements = signal(0);

  subjectForm: FormGroup;

  constructor(
    private subjectService: SubjectService,
    private fb: FormBuilder
  ) {
    this.subjectForm = this.fb.group({
      title: ['', Validators.required],
      parentId: [null]
    });
  }

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(page: number = 0): void {
    this.loading.set(true);
    this.subjectService.getAllSubjects(page, this.pageSize())
      .subscribe({
        next: (response) => {
          this.subjects.set(response.content);
          this.totalElements.set(response.totalElements);
          this.currentPage.set(page);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Error loading subjects');
          this.loading.set(false);
        }
      });
  }

  onPageChange(page: number): void {
    this.loadSubjects(page);
  }

  createSubject(): void {
    if (this.subjectForm.valid) {
      this.loading.set(true);
      this.subjectService.createSubject(this.subjectForm.value)
        .subscribe({
          next: () => {
            this.loadSubjects();
            this.subjectForm.reset();
          },
          error: (err) => {
            this.error.set('Error creating subject');
            this.loading.set(false);
          }
        });
    }
  }

  deleteSubject(id: number): void {
    if (confirm('Are you sure you want to delete this subject?')) {
      this.loading.set(true);
      this.subjectService.deleteSubject(id)
        .subscribe({
          next: () => {
            this.loadSubjects();
          },
          error: (err) => {
            this.error.set('Error deleting subject');
            this.loading.set(false);
          }
        });
    }
  }
}
