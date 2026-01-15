import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Employee } from '../../Employee';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly baseUrl = 'http://localhost:8089/employees';

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
   * Get all employees
   */
  getAll(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.baseUrl, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get employee by ID
   */
  getById(id: string | number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Create a new employee
   */
  create(employee: {
    firstName: string;
    lastName: string;
    street?: string;
    postcode?: string;
    city?: string;
    phone?: string;
    skillSet: number[];
  }): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, employee, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.toastService.success('Mitarbeiter erfolgreich erstellt')),
      catchError(error => {
        this.toastService.error('Fehler beim Erstellen des Mitarbeiters');
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing employee
   */
  update(id: string | number, employee: {
    firstName: string;
    lastName: string;
    street?: string;
    postcode?: string;
    city?: string;
    phone?: string;
    skillSet: number[];
  }): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/${id}`, employee, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.toastService.success('Mitarbeiter erfolgreich aktualisiert')),
      catchError(error => {
        this.toastService.error('Fehler beim Aktualisieren des Mitarbeiters');
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete an employee
   */
  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.toastService.success('Mitarbeiter erfolgreich gelöscht')),
      catchError(error => {
        this.toastService.error('Fehler beim Löschen des Mitarbeiters');
        return throwError(() => error);
      })
    );
  }

  /**
   * Prepare employee data for API request
   * Converts Employee object to API format with skill IDs
   */
  prepareEmployeeData(employee: Employee, availableQualifications: any[]): {
    firstName: string;
    lastName: string;
    street: string;
    postcode: string;
    city: string;
    phone: string;
    skillSet: number[];
  } {
    const skillSetIds = employee.skillSet?.map(skill => {
      if ('id' in skill && skill.id !== undefined) {
        return skill.id;
      }
      const qualification = availableQualifications.find(q => q.skill === skill.skill);
      return qualification?.id;
    }).filter((id): id is number => id !== undefined) || [];

    return {
      lastName: employee.lastName || '',
      firstName: employee.firstName || '',
      street: employee.street || '',
      postcode: employee.postcode || '',
      city: employee.city || '',
      phone: employee.phone || '',
      skillSet: skillSetIds
    };
  }
}

