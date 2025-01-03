import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from '../../../core/models/subject.model';
import { Question } from '../../../core/models/question.model';
import { SubjectService } from '../../../core/services/subject.service';
import { QuestionService } from '../../../core/services/question.service';

@Component({
  selector: 'app-subject-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './subject-detail.component.html',
  styleUrls: ['./subject-detail.component.css']
})
export class SubjectDetailComponent implements OnInit {
  subject = signal<Subject | null>(null);
  questions = signal<Question[]>([]);
  children = signal<Subject[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  editing = signal(false);

  subjectForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private subjectService: SubjectService,
    private questionService: QuestionService,
    private fb: FormBuilder
  ) {
    this.subjectForm = this.fb.group({
      title: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadSubject(id);
    }
  }

  loadSubject(id: number): void {
    this.loading.set(true);
    this.subjectService.getSubjectById(id)
      .subscribe({
        next: (subject) => {
          this.subject.set(subject);
          this.subjectForm.patchValue({
            title: subject.title
          });
          this.loadChildren(id);
          this.loadQuestions(id);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Error loading subject');
          this.loading.set(false);
        }
      });
  }

  loadChildren(id: number): void {
    this.subjectService.getChildSubjects(id)
      .subscribe({
        next: (children) => {
          this.children.set(children);
        },
        error: (err) => {
          this.error.set('Error loading child subjects');
        }
      });
  }

  loadQuestions(id: number): void {
    this.questionService.getQuestionsBySubjectId(id)
      .subscribe({
        next: (response) => {
          this.questions.set(response.content);
        },
        error: (err) => {
          this.error.set('Error loading questions');
        }
      });
  }

  startEditing(): void {
    this.editing.set(true);
  }

  cancelEditing(): void {
    this.editing.set(false);
    if (this.subject()) {
      this.subjectForm.patchValue({
        title: this.subject()!.title
      });
    }
  }

  saveSubject(): void {
    const currentSubject = this.subject();
    if (this.subjectForm.valid && currentSubject && typeof currentSubject.id === 'number') {
      this.loading.set(true);
      this.subjectService.updateSubject(currentSubject.id, {
        ...currentSubject,
        ...this.subjectForm.value
      }).subscribe({
        next: (updatedSubject) => {
          this.subject.set(updatedSubject);
          this.loading.set(false);
          this.editing.set(false);
        },
        error: (err) => {
          this.error.set('Erreur lors de la mise à jour du sujet');
          this.loading.set(false);
        }
      });
    } else {
      // Gestion du cas où le formulaire est invalide ou le sujet n'existe pas
      this.error.set('Veuillez remplir correctement le formulaire');
    }
  }
}
