import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Qualification } from '../../Qualification';
import { AuthService } from '../../services/auth/auth.service';

interface EmployeeBasic {
  id: number;
  lastName: string;
  firstName: string;
}

interface QualificationDetailsResponse {
  qualification: Qualification;
  employees: EmployeeBasic[];
}

@Component({
  selector: 'app-qualification-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './qualification-details.component.html',
  styleUrl: './qualification-details.component.css'
})
export class QualificationDetailsComponent implements OnInit {
  qualification: Qualification | null = null;
  employees: EmployeeBasic[] = [];
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
    }
  }

  fetchQualificationDetails() {
    const token = this.authService.getAccessToken();
    this.http.get<QualificationDetailsResponse>(`http://localhost:8089/qualifications/${this.qualificationId}/employees`, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
    }).subscribe({
      next: (data) => {
        this.qualification = data.qualification;
        this.employees = data.employees;
      },
      error: (err) => console.error('Error fetching qualification details:', err)
    });
  }

  getInitials(employee: EmployeeBasic): string {
    const first = employee.firstName?.charAt(0) || '';
    const last = employee.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  viewEmployee(employee: EmployeeBasic) {
    this.router.navigate(['/employees', employee.id]);
  }
}
