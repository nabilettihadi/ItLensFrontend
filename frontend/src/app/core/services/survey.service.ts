import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Survey } from '../models/survey.model';
import { environment } from '../../../environments/environment';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private apiUrl = `${environment.apiUrl}/api/surveys`;

  constructor(private http: HttpClient) {}

  getAllSurveys(page: number = 0, size: number = 10): Observable<Page<Survey>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Survey>>(this.apiUrl, { params });
  }

  getSurveyById(id: number): Observable<Survey> {
    return this.http.get<Survey>(`${this.apiUrl}/${id}`);
  }

  getSurveysByOwnerId(ownerId: number, page: number = 0, size: number = 10): Observable<Page<Survey>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Survey>>(`${this.apiUrl}/owner/${ownerId}`, { params });
  }

  createSurvey(surveyDTO: Survey): Observable<Survey> {
    return this.http.post<Survey>(this.apiUrl, surveyDTO);
  }

  updateSurvey(id: number, surveyDTO: Survey): Observable<Survey> {
    return this.http.put<Survey>(`${this.apiUrl}/${id}`, surveyDTO);
  }

  deleteSurvey(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
