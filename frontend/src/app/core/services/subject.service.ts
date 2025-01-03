import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from '../models/subject.model';
import { environment } from '../../../environments/environment';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private apiUrl = `${environment.apiUrl}/api/subjects`;

  constructor(private http: HttpClient) {}

  getAllSubjects(page: number = 0, size: number = 10): Observable<Page<Subject>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Subject>>(this.apiUrl, { params });
  }

  getSubjectById(id: number): Observable<Subject> {
    return this.http.get<Subject>(`${this.apiUrl}/${id}`);
  }

  getSubjectsByEditionId(editionId: number, page: number = 0, size: number = 10): Observable<Page<Subject>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Subject>>(`${this.apiUrl}/edition/${editionId}`, { params });
  }

  createSubject(subject: Subject): Observable<Subject> {
    return this.http.post<Subject>(this.apiUrl, subject);
  }

  updateSubject(id: number, subject: Subject): Observable<Subject> {
    return this.http.put<Subject>(`${this.apiUrl}/${id}`, subject);
  }

  deleteSubject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getChildSubjects(parentId: number): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiUrl}/${parentId}/children`);
  }
}
