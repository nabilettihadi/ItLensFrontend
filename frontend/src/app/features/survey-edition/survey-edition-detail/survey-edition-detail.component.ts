import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SurveyEdition } from '../../../core/models/survey-edition.model';
import { SurveyEditionService } from '../../../core/services/survey-edition.service';
import { SurveyService } from '../../../core/services/survey.service';
import { Survey } from '../../../core/models/survey.model';
import { Subject } from '../../../core/models/subject.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-survey-edition-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './survey-edition-detail.component.html',
  styleUrls: ['./survey-edition-detail.component.css']
})
export class SurveyEditionDetailComponent {
  edition = signal<SurveyEdition | null>(null);
  survey = signal<Survey | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  expandedSubjects = signal<Set<number>>(new Set<number>());
  selectedSubject = signal<Subject | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveyEditionService: SurveyEditionService,
    private surveyService: SurveyService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        // Si nous avons un ID direct d'édition
        this.loadEdition(+params['id']);
      } else if (params['surveyId'] && params['year']) {
        // Si nous avons un ID de survey et une année
        this.loadEditionByYearAndSurveyId(+params['surveyId'], +params['year']);
      } else {
        this.error.set('Invalid URL parameters');
      }
    });
  }

  loadEdition(editionId: number): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.surveyEditionService.getEditionById(editionId).subscribe({
      next: (edition: SurveyEdition) => {
        this.edition.set(edition);
        if (edition.survey?.id) {
          this.loadSurveyDetails(edition.survey.id);
        } else {
          this.loading.set(false);
        }
      },
      error: (error: any) => {
        console.error('Error loading edition:', error);
        this.error.set('Failed to load edition details');
        this.loading.set(false);
      }
    });
  }

  loadSurveyDetails(surveyId: number): void {
    this.surveyService.getSurveyById(surveyId).subscribe({
      next: (survey: Survey) => {
        this.survey.set(survey);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading survey:', error);
        this.error.set('Failed to load survey details');
        this.loading.set(false);
      }
    });
  }

  loadEditionByYearAndSurveyId(surveyId: number, year: number): void {
    this.loading.set(true);
    this.surveyEditionService.getEditionsBySurveyId(surveyId).subscribe({
      next: (editions: SurveyEdition[]) => {
        const edition = editions.find((e: SurveyEdition) => e.year === year);
        if (edition) {
          this.edition.set(edition);
          this.surveyService.getSurveyById(surveyId).subscribe({
            next: (survey: Survey) => {
              this.survey.set(survey);
              this.loading.set(false);
            },
            error: (err: Error) => {
              this.error.set('Failed to load survey details');
              this.loading.set(false);
              console.error(err);
            }
          });
        } else {
          this.error.set('Edition not found');
          this.loading.set(false);
        }
      },
      error: (err: Error) => {
        this.error.set('Failed to load edition details');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  getEditionStatus(): string {
    const edition = this.edition();
    if (!edition) return 'Unknown';

    const startDate = new Date(edition.startDate);
    const now = new Date();

    if (startDate > now) {
      return 'Upcoming';
    } else {
      return 'Active';
    }
  }

  getStatusClass(): string {
    const status = this.getEditionStatus();
    switch (status) {
      case 'Upcoming':
        return 'badge bg-info';
      case 'Active':
        return 'badge bg-success';
      default:
        return 'badge bg-secondary';
    }
  }

  editEdition(): void {
    const edition = this.edition();
    if (edition && edition.survey) {
      this.router.navigate(['/survey', edition.survey.id, 'editions', edition.id, 'edit']);
    }
  }

  deleteEdition(): void {
    const edition = this.edition();
    if (!edition || !edition.id) return;

    if (confirm('Are you sure you want to delete this edition?')) {
      this.loading.set(true);
      this.surveyEditionService.deleteEdition(edition.id).subscribe({
        next: () => {
          this.loading.set(false);
          if (edition.survey) {
            this.router.navigate(['/survey', edition.survey.id, 'editions']);
          } else {
            this.router.navigate(['/surveys']);
          }
        },
        error: (err: Error) => {
          this.error.set('Failed to delete edition');
          this.loading.set(false);
          console.error(err);
        }
      });
    }
  }

  addSubject(): void {
    const edition = this.edition();
    if (edition && edition.survey) {
      this.router.navigate(['/survey', edition.survey.id, 'editions', edition.id, 'subjects', 'new']);
    }
  }

  viewSubject(subject: Subject): void {
    const edition = this.edition();
    if (edition && edition.survey) {
      this.router.navigate(['/survey', edition.survey.id, 'editions', edition.id, 'subjects', subject.id]);
    }
  }

  editSubject(subject: Subject): void {
    const edition = this.edition();
    if (edition && edition.survey) {
      this.router.navigate(['/survey', edition.survey.id, 'editions', edition.id, 'subjects', subject.id, 'edit']);
    }
  }

  deleteSubject(subject: Subject): void {
    if (!subject.id) return;

    if (confirm('Are you sure you want to delete this subject?')) {
      this.loading.set(true);
      // TODO: Implement subject deletion
      console.log('Deleting subject:', subject.id);
      this.loading.set(false);
    }
  }

  navigateBack(): void {
    const edition = this.edition();
    if (edition && edition.survey) {
      this.router.navigate(['/survey', edition.survey.id, 'editions']);
    } else {
      this.router.navigate(['/surveys']);
    }
  }

  // Méthodes pour la gestion des sujets
  getRootSubjects(): Subject[] {
    return this.edition()?.subjects?.filter(subject => !subject.parentId) || [];
  }

  getChildSubjects(parentId: number): Subject[] {
    return this.edition()?.subjects?.filter(subject => subject.parentId === parentId) || [];
  }

  hasChildren(subject: Subject): boolean {
    return this.edition()?.subjects?.some(s => s.parentId === subject.id) || false;
  }

  isExpanded(subjectId: number): boolean {
    return this.expandedSubjects().has(subjectId);
  }

  toggleSubject(subjectId: number): void {
    const expanded = new Set(this.expandedSubjects());
    if (expanded.has(subjectId)) {
      expanded.delete(subjectId);
    } else {
      expanded.add(subjectId);
    }
    this.expandedSubjects.set(expanded);
  }

  selectSubject(subject: Subject): void {
    this.selectedSubject.set(subject);
  }

  getSelectedSubjectQuestions(): any[] {
    return this.selectedSubject()?.questions || [];
  }
}
