import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../toast/toast.service';
import {Employee, Skill} from "../../Employee";

interface QualificationDetailsResponse {
  qualification: Skill;
  employees: Employee[];
}

@Injectable({
  providedIn: 'root'
})
export class QualificationService {
  private readonly baseUrl = 'http://localhost:8089/qualifications';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  getAll(): Observable<Skill[]> {
    return this.http.get<Skill[]>(this.baseUrl, {
      headers: this.getHeaders()
    });
  }

  getById(id: string | number): Observable<Skill> {
    return this.http.get<Skill>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  getDetailsWithEmployees(id: string | number): Observable<QualificationDetailsResponse> {
    return this.http.get<QualificationDetailsResponse>(`${this.baseUrl}/${id}/employees`, {
      headers: this.getHeaders()
    });
  }

  create(qualification: Skill): Observable<Skill> {
    return this.http.post<Skill>(this.baseUrl, qualification, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.toastService.success('Qualifikation erfolgreich erstellt')),
      catchError(error => {
        this.toastService.error('Fehler beim Erstellen der Qualifikation');
        return throwError(() => error);
      })
    );
  }

  update(id: string | number, qualification: Skill): Observable<Skill> {
    return this.http.put<Skill>(`${this.baseUrl}/${id}`, qualification, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.toastService.success('Qualifikation erfolgreich aktualisiert')),
      catchError(error => {
        this.toastService.error('Fehler beim Aktualisieren der Qualifikation');
        return throwError(() => error);
      })
    );
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.toastService.success('Qualifikation erfolgreich gelöscht')),
      catchError(error => {
        this.toastService.error('Fehler beim Löschen der Qualifikation');
        return throwError(() => error);
      })
    );
  }
}

