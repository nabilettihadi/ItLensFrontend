import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SurveyEdition } from '../models/survey-edition.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SurveyEditionService {
  private apiUrl = `${environment.apiUrl}/api/editions`;

  constructor(private http: HttpClient) {}

  createSurveyEdition(edition: SurveyEdition): Observable<SurveyEdition> {
    return this.http.post<SurveyEdition>(this.apiUrl, edition);
  }

  getSurveyEditionsBySurveyId(surveyId: number): Observable<SurveyEdition[]> {
    return this.http.get<SurveyEdition[]>(`${environment.apiUrl}/api/surveys/${surveyId}/editions`);
  }

  getSurveyEditionById(id: number): Observable<SurveyEdition> {
    return this.http.get<SurveyEdition>(`${this.apiUrl}/${id}`);
  }

  updateSurveyEdition(id: number, edition: SurveyEdition): Observable<SurveyEdition> {
    return this.http.put<SurveyEdition>(`${this.apiUrl}/${id}`, edition);
  }

  deleteSurveyEdition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
