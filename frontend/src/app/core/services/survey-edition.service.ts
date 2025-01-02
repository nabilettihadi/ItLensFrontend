import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SurveyEdition } from '../models/survey-edition.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SurveyEditionService {
  private apiUrl = `${environment.apiBaseUrl}/editions`;

  constructor(private http: HttpClient) {}

  // Error handling method
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Create Survey Edition with enhanced error handling
  createSurveyEdition(surveyEdition: SurveyEdition): Observable<SurveyEdition> {
    return this.http.post<SurveyEdition>(this.apiUrl, surveyEdition)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Alias pour la compatibilité
  createSurveyEditionNew(surveyEdition: SurveyEdition): Observable<SurveyEdition> {
    return this.createSurveyEdition(surveyEdition);
  }

  // Get Survey Editions by Survey ID with enhanced error handling
  getSurveyEditionsBySurveyId(surveyId: number): Observable<SurveyEdition[]> {
    return this.http.get<SurveyEdition[]>(`${environment.apiBaseUrl}/survey-editions/survey/${surveyId}`)
      .pipe(catchError(this.handleError));
  }

  // Get Survey Edition by ID with enhanced error handling
  getSurveyEditionById(id: number): Observable<SurveyEdition> {
    return this.http.get<SurveyEdition>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Update Survey Edition with enhanced error handling
  updateSurveyEdition(id: number, edition: SurveyEdition): Observable<SurveyEdition> {
    return this.http.put<SurveyEdition>(`${this.apiUrl}/${id}`, edition)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Update Survey Edition with enhanced error handling
  updateSurveyEditionNew(id: number, surveyEdition: SurveyEdition): Observable<SurveyEdition> {
    return this.updateSurveyEdition(id, surveyEdition);
  }

  // Delete Survey Edition with enhanced error handling
  deleteSurveyEdition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get Survey Edition by Year and Survey ID with enhanced error handling
  getSurveyEditionByYearAndSurveyId(surveyId: number, year: number): Observable<SurveyEdition> {
    return this.http.get<SurveyEdition[]>(`${this.apiUrl}/survey/${surveyId}`)
      .pipe(
        map(editions => {
          const edition = editions.find(ed => ed.year === year);
          if (!edition) {
            throw new Error(`No edition found for survey ${surveyId} in year ${year}`);
          }
          return edition;
        }),
        catchError(this.handleError)
      );
  }

  // Get Survey Edition by Year and Survey ID with detailed error handling
  getSurveyEditionByYear(surveyId: number, year: number): Observable<SurveyEdition> {
    return this.http.get<SurveyEdition>(`${this.apiUrl}/survey/${surveyId}/year/${year}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            // Specific handling for not found
            return throwError(() => new Error(`No survey edition found for survey ${surveyId} in year ${year}`));
          }
          // Generic error handling
          return this.handleError(error);
        })
      );
  }

  // Get all years for a specific survey
  getSurveyEditionYears(surveyId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/survey/${surveyId}/years`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Pagination method for Survey Editions
  getSurveyEditionsPaginated(
    surveyId: number, 
    page: number = 0, 
    size: number = 10, 
    sortBy: string = 'year'
  ): Observable<any> {
    return this.http.get(`${this.apiUrl}/survey/${surveyId}/paginated`, {
      params: {
        page: page.toString(),
        size: size.toString(),
        sort: sortBy
      }
    }).pipe(
      catchError(this.handleError)
    );
  }
}
