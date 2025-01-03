import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { SurveyEditionService } from '../../../core/services/survey-edition.service';
import { SubjectService } from '../../../core/services/subject.service';
import { QuestionService } from '../../../core/services/question.service';
import { SurveyEdition } from '../../../core/models/survey-edition.model';
import { Subject } from '../../../core/models/subject.model';
import { Question } from '../../../core/models/question.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-survey-edition-participate',
  templateUrl: './survey-edition-participate.component.html',
  styleUrls: ['./survey-edition-participate.component.css']
})
export class SurveyEditionParticipateComponent implements OnInit {
  surveyEditionId!: number;
  surveyEdition!: SurveyEdition;
  rootSubjects: Subject[] = [];
  participationForm!: FormGroup;
  isLoading = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private surveyEditionService: SurveyEditionService,
    private subjectService: SubjectService,
    private questionService: QuestionService
  ) { }

  ngOnInit(): void {
    const surveyEditionIdParam = this.route.snapshot.paramMap.get('surveyEditionId');
    this.surveyEditionId = surveyEditionIdParam ? +surveyEditionIdParam : 0;
    this.initializeForm();
    this.loadSurveyEditionDetails();
  }

  initializeForm(): void {
    this.participationForm = this.formBuilder.group({
      responses: this.formBuilder.array([])
    });
  }

  loadSurveyEditionDetails(): void {
    this.isLoading = true;
    this.surveyEditionService.getEditionById(this.surveyEditionId).subscribe({
      next: (edition: SurveyEdition) => {
        this.surveyEdition = edition;
        this.loadRootSubjects();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'Impossible de charger les détails de l\'édition du survey';
        this.isLoading = false;
        console.error('Erreur de chargement de l\'édition:', error);
      }
    });
  }

  loadRootSubjects(): void {
    this.subjectService.getAllSubjects().subscribe({
      next: (response: any) => {
        this.rootSubjects = response.content || response;
        this.populateQuestions();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'Impossible de charger les sujets racines';
        this.isLoading = false;
        console.error('Erreur de chargement des sujets:', error);
      }
    });
  }

  populateQuestions(): void {
    this.rootSubjects.forEach(subject => {
      this.loadQuestionsForSubject(subject.id ?? 0);
    });
  }

  loadQuestionsForSubject(subjectId: number): void {
    this.questionService.getQuestionsBySubjectId(subjectId).subscribe({
      next: (response: any) => {
        const questions = response.content || response;
        questions.forEach((question: Question) => {
          this.addQuestionToForm(question);
        });
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'Impossible de charger les questions';
        this.isLoading = false;
        console.error('Erreur de chargement des questions:', error);
      }
    });
  }

  addQuestionToForm(question: Question): void {
    const responsesArray = this.participationForm.get('responses') as FormArray;
    responsesArray.push(
      this.formBuilder.group({
        questionId: [question.id, Validators.required],
        answerIds: [[], Validators.required]
      })
    );
  }

  onSubmit(): void {
    if (this.participationForm.valid) {
      this.isLoading = true;
      this.surveyEditionService.participate(this.surveyEditionId, this.participationForm.value).subscribe({
        next: () => {
          this.router.navigate(['/api/survey-editions', this.surveyEditionId]);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = 'Erreur lors de la participation au survey';
          this.isLoading = false;
          console.error('Erreur de participation:', error);
        }
      });
    }
  }

  // Méthode pour gérer la sélection des réponses
  onAnswerSelect(questionIndex: number, answerId: number): void {
    const responsesArray = this.participationForm.get('responses') as FormArray;
    const questionGroup = responsesArray.at(questionIndex);
    const currentAnswersControl = questionGroup.get('answerIds');
    
    if (currentAnswersControl) {
      const currentAnswers = currentAnswersControl.value;

      if (currentAnswers.includes(answerId)) {
        // Désélectionner si déjà sélectionné
        currentAnswersControl.setValue(
          currentAnswers.filter((id: number) => id !== answerId)
        );
      } else {
        // Sélectionner
        currentAnswersControl.setValue([...currentAnswers, answerId]);
      }
    }
  }
}
