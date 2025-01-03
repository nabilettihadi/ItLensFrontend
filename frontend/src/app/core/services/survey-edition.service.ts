import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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

  createEdition(edition: Partial<SurveyEdition> & { surveyId?: number }): Observable<SurveyEdition> {
    if (!edition.surveyId || isNaN(Number(edition.surveyId))) {
      return throwError(() => new Error('Invalid survey ID'));
    }

    // Format dates to local format (YYYY-MM-DD)
    const payload = {
      year: edition.year,
      startDate: edition.startDate,  // Keep as YYYY-MM-DD
      creationDate: edition.creationDate,  // Keep as YYYY-MM-DD
      surveyId: edition.surveyId
    };

    console.log('Creating survey edition with payload:', payload);

    return this.http.post<SurveyEdition>(this.apiUrl, payload).pipe(
      tap(response => console.log('Survey edition created successfully:', response)),
      catchError((error: HttpErrorResponse) => {
        console.error('Survey Edition Creation Error:', error);
        if (error.error?.message) {
          return throwError(() => new Error(error.error.message));
        }
        // Log the full error details
        if (error.error) {
          console.error('Error details:', error.error);
        }
        return throwError(() => error);
      })
    );
  }

  updateEdition(edition: SurveyEdition): Observable<SurveyEdition> {
    if (!edition.id) {
      return throwError(() => new Error('Edition ID is required for update'));
    }
    return this.http.put<SurveyEdition>(`${this.apiUrl}/${edition.id}`, edition);
  }

  deleteEdition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  participate(surveyEditionId: number, participationData: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${surveyEditionId}/participate`, participationData);
  }
}
