import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Owner } from '../models/owner.model';
import { Page } from '../models/page.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OwnerService {
  private apiUrl = `${environment.apiBaseUrl}/owners`;

  constructor(private http: HttpClient) {}

  getOwners(page: number = 0, size: number = 10): Observable<Page<Owner>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<Page<Owner>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Owner> {
    return this.http.get<Owner>(`${this.apiUrl}/${id}`);
  }

  createOwner(owner: Partial<Owner>): Observable<Owner> {
    return this.http.post<Owner>(this.apiUrl, owner);
  }

  updateOwner(id: number, owner: Partial<Owner>): Observable<Owner> {
    return this.http.put<Owner>(`${this.apiUrl}/${id}`, owner);
  }

  deleteOwner(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getOrCreateOwner(name: string): Observable<Owner> {
    return this.http.post<Owner>(`${this.apiUrl}/get-or-create`, { name });
  }
}
