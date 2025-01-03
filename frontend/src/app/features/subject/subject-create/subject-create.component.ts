import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SubjectService } from '../../../core/services/subject.service';

@Component({
  selector: 'app-subject-create',
  templateUrl: './subject-create.component.html',
  styleUrls: ['./subject-create.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class SubjectCreateComponent {
  subjectForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private subjectService: SubjectService,
    private router: Router
  ) {
    this.subjectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.subjectForm.valid) {
      this.loading = true;
      this.error = null;

      this.subjectService.createSubject(this.subjectForm.value).subscribe({
        next: () => {
          this.router.navigate(['/api/subjects']);
        },
        error: (error) => {
          this.error = error.message || 'Error creating subject';
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/api/subjects']);
  }
}
