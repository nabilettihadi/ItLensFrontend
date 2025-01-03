import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { QuestionService } from '../../../core/services/question.service';
import { SubjectService } from '../../../core/services/subject.service';
import { Question } from '../../../core/models/question.model';
import { Subject } from '../../../core/models/subject.model';
import { HttpErrorResponse } from '@angular/common/http';
import { QuestionType } from '../../../core/models/question-type.enum';

@Component({
  selector: 'app-question-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './question-create.component.html',
  styleUrls: ['./question-create.component.css']
})
export class QuestionCreateComponent implements OnInit {
  questionForm!: FormGroup;
  subjects: Subject[] = [];
  loading = signal(false);
  error = signal<string | null>(null);
  questionTypes = Object.values(QuestionType);

  constructor(
    private fb: FormBuilder,
    private questionService: QuestionService,
    private subjectService: SubjectService,
    private router: Router
  ) {
    this.questionForm = this.fb.group({
      text: ['', [
        Validators.required, 
        Validators.minLength(5),
        Validators.maxLength(500)
      ]],
      type: [QuestionType.SINGLE_CHOICE, Validators.required],
      subjectId: [null, Validators.required],
      answers: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadSubjects();
  }

  initForm(): void {
    // Add two initial empty answers
    this.addAnswer();
    this.addAnswer();

    // Add form value change listener for validation
    this.questionForm.valueChanges.subscribe(() => {
      this.validateForm();
    });
  }

  validateForm(): void {
    const textControl = this.questionForm.get('text');
    const subjectIdControl = this.questionForm.get('subjectId');
    const answersArray = this.questionForm.get('answers') as FormArray;

    if (textControl && textControl.invalid && (textControl.dirty || textControl.touched)) {
      const errors = textControl.errors;
      if (errors?.['required']) {
        this.error.set('Le texte de la question est requis.');
      } else if (errors?.['minlength']) {
        this.error.set('Le texte doit avoir au moins 5 caractères.');
      } else if (errors?.['maxlength']) {
        this.error.set('Le texte ne peut pas dépasser 500 caractères.');
      }
    }

    if (subjectIdControl && subjectIdControl.invalid && (subjectIdControl.dirty || subjectIdControl.touched)) {
      this.error.set('Un sujet doit être sélectionné.');
    }

    if (answersArray.invalid) {
      const arrayErrors = answersArray.errors;
      if (arrayErrors?.['required']) {
        this.error.set('Au moins deux réponses sont requises.');
      }
    }

    // Validate each answer
    answersArray.controls.forEach((answerControl: any, index: number) => {
      if (answerControl.invalid && (answerControl.dirty || answerControl.touched)) {
        const errors = answerControl.errors;
        if (errors?.['required']) {
          this.error.set(`Le texte de la réponse ${index + 1} est requis.`);
        }
      }
    });
  }

  loadSubjects(): void {
    this.loading.set(true);
    this.error.set(null);
    this.subjectService.getAllSubjects().subscribe({
      next: (response: any) => {
        this.subjects = response.content || response;
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error, 'Impossible de charger les sujets');
      }
    });
  }

  get answers() {
    return this.questionForm.get('answers') as FormArray;
  }

  addAnswer() {
    const answerGroup = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]]
    });
    this.answers.push(answerGroup);
  }

  removeAnswer(index: number) {
    if (this.answers.length > 2) {
      this.answers.removeAt(index);
    } else {
      this.error.set('Au moins deux réponses sont requises.');
    }
  }

  getAnswerError(index: number): string | null {
    const control = this.answers.at(index).get('text');
    if (control?.invalid && control?.touched) {
      if (control?.errors?.['required']) {
        return 'Le texte de la réponse est requis.';
      }
    }
    return null;
  }

  onSubmit() {
    if (this.questionForm.valid) {
      this.loading.set(true);
      this.error.set(null);

      const questionData: Question = {
        text: this.questionForm.get('text')?.value ?? '',
        type: this.questionForm.get('type')?.value ?? QuestionType.SINGLE_CHOICE,
        subjectId: this.questionForm.get('subjectId')?.value ?? 0,
        answers: this.answers.value.map((answer: any) => ({
          text: answer.text ?? ''
        }))
      };

      this.questionService.createQuestion(questionData).subscribe({
        next: (createdQuestion) => {
          this.router.navigate(['/api/questions/subject', questionData.subjectId]);
        },
        error: (error) => {
          this.error.set(error.message || 'Erreur lors de la création de la question');
          this.loading.set(false);
        }
      });
    }
  }

  private handleError(error: HttpErrorResponse, defaultMessage: string): void {
    this.loading.set(false);
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      this.error.set(`Erreur: ${error.error.message}`);
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 400:
          this.error.set('Données invalides. Veuillez vérifier vos informations.');
          break;
        case 401:
          this.error.set('Non autorisé. Veuillez vous connecter.');
          break;
        case 403:
          this.error.set('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
          break;
        case 404:
          this.error.set('Ressource non trouvée.');
          break;
        case 500:
          this.error.set('Erreur serveur. Veuillez réessayer plus tard.');
          break;
        default:
          this.error.set(defaultMessage);
      }
    }
    console.error('Erreur détaillée:', error);
  }

  onCancel(): void {
    this.router.navigate(['/api/questions']);
  }
}
