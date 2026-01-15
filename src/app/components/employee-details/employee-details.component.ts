import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Employee, Skill } from '../../Employee';
import { Qualification } from '../../Qualification';
import { AuthService } from '../../services/auth/auth.service';
import { EmployeeModalComponent } from '../employee-modal/employee-modal.component';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EmployeeModalComponent],
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.css'
})
export class EmployeeDetailsComponent implements OnInit {
  employee: Employee | null = null;
  employeeId: string | null = null;

  showSkillsModal = false;
  newSkill = '';
  availableQualifications: Qualification[] = [];
  showEditModal = false;

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
    this.fetchAvailableQualifications();
  }

  closeSkillsModal() {
    this.showSkillsModal = false;
    this.newSkill = '';
  }

  fetchAvailableQualifications() {
    const token = this.authService.getAccessToken();
    this.http.get<Qualification[]>('http://localhost:8089/qualifications', {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
    }).subscribe({
      next: (data) => {
        this.availableQualifications = data;
      },
      error: (err) => console.error('Error fetching available qualifications:', err)
    });
  }

  addSkill() {
    if (!this.newSkill.trim() || !this.employee) return;

    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    // Find the qualification ID
    const qualification = this.availableQualifications.find(q => q.skill === this.newSkill.trim());
    if (!qualification || !qualification.id) {
      console.error('Qualification not found');
      return;
    }

    // Add the skill to the employee's skillSet
    if (!this.employee.skillSet) {
      this.employee.skillSet = [];
    }

    // Check if skill is not already in the list
    const alreadyExists = this.employee.skillSet.some(s => s.skill === this.newSkill.trim());
    if (!alreadyExists) {
      this.employee.skillSet.push({ skill: this.newSkill.trim(), id: qualification.id });
    }

    // Build the skillSet array with IDs
    const skillSetIds = this.employee.skillSet.map(skill => {
      if ('id' in skill && skill.id !== undefined) {
        return skill.id;
      }
      const qual = this.availableQualifications.find(q => q.skill === skill.skill);
      return qual?.id;
    }).filter((id): id is number => id !== undefined);

    // Prepare the employee update body
    const requestBody = {
      lastName: this.employee.lastName,
      firstName: this.employee.firstName,
      street: this.employee.street || '',
      postcode: this.employee.postcode || '',
      city: this.employee.city || '',
      phone: this.employee.phone || '',
      skillSet: skillSetIds
    };

    // Update the entire employee via PUT
    this.http.put(`http://localhost:8089/employees/${this.employee.id}`,
      requestBody,
      { headers }
    ).subscribe({
      next: () => {
        this.newSkill = '';
        this.fetchEmployeeDetails(); // Refresh to get updated data
      },
      error: (err) => console.error('Error adding skill:', err)
    });
  }

  isSkillAlreadyAdded(skillName: string): boolean {
    return this.employee?.skillSet?.some(skill => skill.skill === skillName) || false;
  }

  deleteSkill(skill: Skill) {
    if (!this.employee || !skill.id) return;

    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    // Remove skill from employee's skillSet
    if (this.employee.skillSet) {
      this.employee.skillSet = this.employee.skillSet.filter(s => s.skill !== skill.skill);
    }

    // Build the skillSet array with IDs
    const skillSetIds = this.employee.skillSet?.map(s => {
      if ('id' in s && s.id !== undefined) {
        return s.id;
      }
      const qual = this.availableQualifications.find(q => q.skill === s.skill);
      return qual?.id;
    }).filter((id): id is number => id !== undefined) || [];

    // Prepare the employee update body
    const requestBody = {
      lastName: this.employee.lastName,
      firstName: this.employee.firstName,
      street: this.employee.street || '',
      postcode: this.employee.postcode || '',
      city: this.employee.city || '',
      phone: this.employee.phone || '',
      skillSet: skillSetIds
    };

    // Update the entire employee via PUT
    this.http.put(`http://localhost:8089/employees/${this.employee.id}`,
      requestBody,
      { headers }
    ).subscribe({
      next: () => {
        this.fetchEmployeeDetails(); // Refresh to get updated data
      },
      error: (err) => console.error('Error deleting skill:', err)
    });
  }

  editEmployee() {
    if (!this.employee) return;
    this.fetchAvailableQualifications();
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  onEmployeeSave(employee: Employee) {
    const skillSetIds = employee.skillSet?.map(skill => {
      if ('id' in skill && skill.id !== undefined) {
        return skill.id;
      }
      const qualification = this.availableQualifications.find(q => q.skill === skill.skill);
      return qualification?.id;
    }).filter((id): id is number => id !== undefined) || [];

    const requestBody = {
      lastName: employee.lastName,
      firstName: employee.firstName,
      street: employee.street || '',
      postcode: employee.postcode || '',
      city: employee.city || '',
      phone: employee.phone || '',
      skillSet: skillSetIds
    };

    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    this.http.put(`http://localhost:8089/employees/${employee.id}`, requestBody, { headers }).subscribe({
      next: () => {
        this.fetchEmployeeDetails();
        this.closeEditModal();
      },
      error: (err) => console.error('Error updating employee:', err)
    });
  }

  deleteEmployee() {
    if (!confirm('Sind Sie sicher, dass Sie diesen Mitarbeiter löschen möchten?')) return;

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
