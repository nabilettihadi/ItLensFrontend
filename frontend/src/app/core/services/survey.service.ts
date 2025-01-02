import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Survey } from '../models/survey.model';
import { SurveyEdition } from '../models/survey-edition.model';
import { Page } from '../models/page.model';
import { environment } from '../../../environments/environment';
import { SurveyEditionService } from './survey-edition.service';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private apiUrl = `${environment.apiBaseUrl}/surveys`;

  constructor(
    private http: HttpClient,
    private surveyEditionService: SurveyEditionService
  ) {}

  getSurveys(page: number = 0, size: number = 10): Observable<Page<Survey>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<Page<Survey>>(this.apiUrl, { params });
  }

  getSurveyById(id: number): Observable<Survey> {
    return this.http.get<Survey>(`${this.apiUrl}/${id}`);
  }

  getById(id: number): Observable<Survey> {
    return this.getSurveyById(id);
  }

  createSurvey(survey: Partial<Survey>): Observable<Survey> {
    return this.http.post<Survey>(this.apiUrl, survey);
  }

  updateSurvey(id: number, survey: Partial<Survey>): Observable<Survey> {
    return this.http.put<Survey>(`${this.apiUrl}/${id}`, survey);
  }

  deleteSurvey(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getSurveyEditionsBySurveyId(surveyId: number): Observable<SurveyEdition[]> {
    return this.surveyEditionService.getSurveyEditionsBySurveyId(surveyId);
  }
}
