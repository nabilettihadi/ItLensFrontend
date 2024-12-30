import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Owner } from '../models/owner.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OwnerService {
  private apiUrl = `${environment.apiUrl}/owners`;

  constructor(private http: HttpClient) { }

  getOwnerByName(name: string): Observable<Owner> {
    return this.http.get<Owner>(`${this.apiUrl}/name/${name}`);
  }

  createOwner(owner: Owner): Observable<Owner> {
    return this.http.post<Owner>(this.apiUrl, owner);
  }

  getOrCreateOwner(name: string): Observable<Owner> {
    return new Observable(subscriber => {
      this.getOwnerByName(name).subscribe({
        next: (owner) => subscriber.next(owner),
        error: () => {
          // Si l'owner n'existe pas, on le crée
          this.createOwner({ name }).subscribe({
            next: (newOwner) => subscriber.next(newOwner),
            error: (error) => subscriber.error(error)
          });
        }
      });
    });
  }
}
