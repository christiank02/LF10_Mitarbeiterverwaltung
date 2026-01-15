import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Qualification } from '../../Qualification';
import { QualificationModalComponent } from '../qualification-modal/qualification-modal.component';
import { QualificationService } from '../../services/qualification/qualification.service';

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
  imports: [CommonModule, RouterLink, QualificationModalComponent],
  templateUrl: './qualification-details.component.html',
  styleUrl: './qualification-details.component.css'
})
export class QualificationDetailsComponent implements OnInit {
  qualification: Qualification | null = null;
  employees: EmployeeBasic[] = [];
  qualificationId: string | null = null;

  showEditModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qualificationService: QualificationService
  ) {}

  ngOnInit() {
    this.qualificationId = this.route.snapshot.paramMap.get('id');
    if (this.qualificationId) {
      this.fetchQualificationDetails();
    }
  }

  fetchQualificationDetails() {
    this.qualificationService.getDetailsWithEmployees(this.qualificationId!).subscribe({
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

  editQualification() {
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  onQualificationSave(qualification: Qualification) {
    this.qualificationService.update(qualification.id!, qualification).subscribe({
      next: () => {
        this.fetchQualificationDetails();
        this.closeEditModal();
      },
      error: (err) => console.error('Error updating qualification:', err)
    });
  }

  deleteQualification() {
    if (!confirm(`Sind Sie sicher, dass Sie "${this.qualification?.skill}" löschen möchten?`)) return;

    this.qualificationService.delete(this.qualificationId!).subscribe({
      next: () => this.router.navigate(['/qualifications']),
      error: (err) => console.error('Error deleting qualification:', err)
    });
  }
}
