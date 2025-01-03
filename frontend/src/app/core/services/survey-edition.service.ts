import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SurveyEdition } from '../models/survey-edition.model';
import { environment } from '../../../environments/environment';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class SurveyEditionService {
  private apiUrl = `${environment.apiUrl}/api/survey-editions`;

  constructor(private http: HttpClient) {}

  getAllEditions(page: number = 0, size: number = 10): Observable<Page<SurveyEdition>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<SurveyEdition>>(this.apiUrl, { params });
  }

  getEditionById(id: number): Observable<SurveyEdition> {
    return this.http.get<SurveyEdition>(`${this.apiUrl}/${id}`);
  }

  getEditionsBySurveyId(surveyId: number): Observable<SurveyEdition[]> {
    return this.http.get<SurveyEdition[]>(`${this.apiUrl}/survey/${surveyId}`);
  }

  createEdition(edition: Partial<SurveyEdition>): Observable<SurveyEdition> {
    // Validate surveyId before sending
    if (!edition.survey?.id || isNaN(Number(edition.survey.id))) {
      return throwError(() => new Error('Invalid survey ID'));
    }

    const { id, ...editionWithoutId } = edition;
    return this.http.post<SurveyEdition>(this.apiUrl, {
      ...editionWithoutId,
      surveyId: Number(edition.survey.id)  // Explicitly convert to number
    }).pipe(
      catchError(error => {
        console.error('Survey Edition Creation Error', error);
        return throwError(() => new Error(
          error.error?.message || 'Unknown error occurred'
        ));
      })
    );
  }

  updateEdition(id: number, edition: Partial<SurveyEdition>): Observable<SurveyEdition> {
    return this.http.put<SurveyEdition>(`${this.apiUrl}/${id}`, edition);
  }

  deleteEdition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  participate(surveyEditionId: number, participationData: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${surveyEditionId}/participate`, participationData);
  }
}
