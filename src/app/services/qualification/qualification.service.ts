import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Qualification } from '../../Qualification';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../toast/toast.service';

interface QualificationDetailsResponse {
  qualification: Qualification;
  employees: any[];
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

  /**
   * Generates HTTP headers with Authorization token
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  /**
   * Get all qualifications
   */
  getAll(): Observable<Qualification[]> {
    return this.http.get<Qualification[]>(this.baseUrl, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get qualification by ID
   */
  getById(id: string | number): Observable<Qualification> {
    return this.http.get<Qualification>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get qualification details with employees
   */
  getDetailsWithEmployees(id: string | number): Observable<QualificationDetailsResponse> {
    return this.http.get<QualificationDetailsResponse>(`${this.baseUrl}/${id}/employees`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Create a new qualification
   */
  create(qualification: Qualification): Observable<Qualification> {
    return this.http.post<Qualification>(this.baseUrl, qualification, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.toastService.success('Qualifikation erfolgreich erstellt')),
      catchError(error => {
        this.toastService.error('Fehler beim Erstellen der Qualifikation');
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing qualification
   */
  update(id: string | number, qualification: Qualification): Observable<Qualification> {
    return this.http.put<Qualification>(`${this.baseUrl}/${id}`, qualification, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.toastService.success('Qualifikation erfolgreich aktualisiert')),
      catchError(error => {
        this.toastService.error('Fehler beim Aktualisieren der Qualifikation');
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a qualification
   */
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

