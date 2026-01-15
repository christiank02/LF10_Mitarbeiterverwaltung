import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Employee, Skill } from '../../Employee';
import { Qualification } from '../../Qualification';
import { EmployeeModalComponent } from '../employee-modal/employee-modal.component';
import { EmployeeService } from '../../services/employee/employee.service';
import { QualificationService } from '../../services/qualification/qualification.service';

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
    private employeeService: EmployeeService,
    private qualificationService: QualificationService
  ) {}

  ngOnInit() {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (this.employeeId) {
      this.fetchEmployeeDetails();
    }
  }

  fetchEmployeeDetails() {
    this.employeeService.getById(this.employeeId!).subscribe({
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
    this.qualificationService.getAll().subscribe({
      next: (data) => {
        this.availableQualifications = data;
      },
      error: (err) => console.error('Error fetching available qualifications:', err)
    });
  }

  addSkill() {
    if (!this.newSkill.trim() || !this.employee) return;

    const qualification = this.availableQualifications.find(q => q.skill === this.newSkill.trim());
    if (!qualification || !qualification.id) {
      console.error('Qualification not found');
      return;
    }

    if (!this.employee.skillSet) {
      this.employee.skillSet = [];
    }

    const alreadyExists = this.employee.skillSet.some(s => s.skill === this.newSkill.trim());
    if (!alreadyExists) {
      this.employee.skillSet.push({ skill: this.newSkill.trim(), id: qualification.id });
    }

    const requestBody = this.employeeService.prepareEmployeeData(this.employee, this.availableQualifications);

    this.employeeService.update(this.employee.id!, requestBody).subscribe({
      next: () => {
        this.newSkill = '';
        this.fetchEmployeeDetails();
      },
      error: (err) => console.error('Error adding skill:', err)
    });
  }

  isSkillAlreadyAdded(skillName: string): boolean {
    return this.employee?.skillSet?.some(skill => skill.skill === skillName) || false;
  }

  deleteSkill(skill: Skill) {
    if (!this.employee || !skill.id) return;

    if (this.employee.skillSet) {
      this.employee.skillSet = this.employee.skillSet.filter(s => s.skill !== skill.skill);
    }

    const requestBody = this.employeeService.prepareEmployeeData(this.employee, this.availableQualifications);

    this.employeeService.update(this.employee.id!, requestBody).subscribe({
      next: () => {
        this.fetchEmployeeDetails();
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
    const requestBody = this.employeeService.prepareEmployeeData(employee, this.availableQualifications);

    this.employeeService.update(employee.id!, requestBody).subscribe({
      next: () => {
        this.fetchEmployeeDetails();
        this.closeEditModal();
      },
      error: (err) => console.error('Error updating employee:', err)
    });
  }

  deleteEmployee() {
    if (!confirm(`Sind Sie sicher, dass Sie ${this.employee?.firstName} ${this.employee?.lastName} löschen möchten?`)) return;

    this.employeeService.delete(this.employeeId!).subscribe({
      next: () => this.router.navigate(['/employees']),
      error: (err) => console.error('Error deleting employee:', err)
    });
  }
}
