import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Qualification } from '../../Qualification';
import { Employee } from '../../Employee';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-qualification-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './qualification-details.component.html',
  styleUrl: './qualification-details.component.css'
})
export class QualificationDetailsComponent implements OnInit {
  qualification: Qualification | null = null;
  employees: Employee[] = [];
  qualificationId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.qualificationId = this.route.snapshot.paramMap.get('id');
    if (this.qualificationId) {
      this.fetchQualificationDetails();
      this.fetchEmployeesWithQualification();
    }
  }

  fetchQualificationDetails() {
    const token = this.authService.getAccessToken();
    this.http.get<Qualification>(`http://localhost:8089/qualifications/${this.qualificationId}`, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
    }).subscribe({
      next: (data) => this.qualification = data,
      error: (err) => console.error('Error fetching qualification:', err)
    });
  }

  fetchEmployeesWithQualification() {
    const token = this.authService.getAccessToken();
    this.http.get<Employee[]>(`http://localhost:8089/employees?qualification=${this.qualificationId}`, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
    }).subscribe({
      next: (data) => this.employees = data,
      error: (err) => console.error('Error fetching employees:', err)
    });
  }

  getInitials(employee: Employee): string {
    const first = employee.firstName?.charAt(0) || '';
    const last = employee.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  viewEmployee(employee: Employee) {
    this.router.navigate(['/employees', employee.id]);
  }
}
