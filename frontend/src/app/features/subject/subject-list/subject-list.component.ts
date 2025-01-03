import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SubjectService } from '../../../core/services/subject.service';
import { Subject } from '../../../core/models/subject.model';
import { Observable, map } from 'rxjs';
import { Page } from '../../../core/models/page.model';

@Component({
  selector: 'app-subject-list',
  templateUrl: './subject-list.component.html',
  styleUrls: ['./subject-list.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class SubjectListComponent implements OnInit {
  subjects$: Observable<Subject[]>;
  loading: boolean = false;
  error: string | null = null;

  constructor(private subjectService: SubjectService) {
    this.subjects$ = this.subjectService.getAllSubjects().pipe(
      map((page: Page<Subject>) => page.content)
    );
  }

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.loading = true;
    this.error = null;
    this.subjects$ = this.subjectService.getAllSubjects().pipe(
      map((page: Page<Subject>) => page.content)
    );
    this.loading = false;
  }

  deleteSubject(id: number): void {
    if (confirm('Are you sure you want to delete this subject?')) {
      this.loading = true;
      this.error = null;

      this.subjectService.deleteSubject(id).subscribe({
        next: () => {
          this.loadSubjects();
        },
        error: (error: any) => {
          this.error = error.message || 'Error deleting subject';
          this.loading = false;
        }
      });
    }
  }
}
