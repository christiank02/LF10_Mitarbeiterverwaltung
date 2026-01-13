import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Employee, Skill } from '../../Employee';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-employee-details',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.css'
})
export class EmployeeDetailsComponent implements OnInit {
  employee: Employee | null = null;
  employeeId: string | null = null;
  
  // Skills modal
  showSkillsModal = false;
  newSkill = '';
  availableSkills: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (this.employeeId) {
      this.fetchEmployeeDetails();
    }
  }

  fetchEmployeeDetails() {
    const token = this.authService.getAccessToken();
    this.http.get<Employee>(`http://localhost:8089/employees/${this.employeeId}`, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
    }).subscribe({
      next: (data) => this.employee = data,
      error: (err) => console.error('Error fetching employee:', err)
    });
  }

  getInitials(): string {
    if (!this.employee) return '';
    const first = this.employee.firstName?.charAt(0) || '';
    const last = this.employee.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  openSkillsModal() {
    this.showSkillsModal = true;
    this.fetchAvailableSkills();
  }

  closeSkillsModal() {
    this.showSkillsModal = false;
    this.newSkill = '';
  }

  fetchAvailableSkills() {
    const token = this.authService.getAccessToken();
    this.http.get<any[]>('http://localhost:8089/qualifications', {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
    }).subscribe({
      next: (data) => {
        this.availableSkills = data.map(q => q.skill);
      },
      error: (err) => console.error('Error fetching available skills:', err)
    });
  }

  addSkill() {
    if (!this.newSkill.trim() || !this.employee) return;
    
    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    this.http.post(`http://localhost:8089/employees/${this.employee.id}/qualifications`, 
      { skill: this.newSkill.trim() },
      { headers }
    ).subscribe({
      next: () => {
        this.fetchEmployeeDetails();
        this.newSkill = '';
      },
      error: (err) => console.error('Error adding skill:', err)
    });
  }

  deleteSkill(skill: Skill) {
    if (!this.employee) return;
    
    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:8089/employees/${this.employee.id}/qualifications`, {
      headers,
      body: { skill: skill.skill }
    }).subscribe({
      next: () => this.fetchEmployeeDetails(),
      error: (err) => console.error('Error deleting skill:', err)
    });
  }

  editEmployee() {
    // TODO: Navigate to edit page
    console.log('Edit employee');
  }

  deleteEmployee() {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    
    const token = this.authService.getAccessToken();
    this.http.delete(`http://localhost:8089/employees/${this.employeeId}`, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
    }).subscribe({
      next: () => this.router.navigate(['/employees']),
      error: (err) => console.error('Error deleting employee:', err)
    });
  }
}
