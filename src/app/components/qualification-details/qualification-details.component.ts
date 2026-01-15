import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QualificationModalComponent } from '../qualification-modal/qualification-modal.component';
import { QualificationService } from '../../services/qualification/qualification.service';
import {Employee, Skill} from "../../Employee";

@Component({
  selector: 'app-qualification-details',
  standalone: true,
  imports: [CommonModule, RouterLink, QualificationModalComponent],
  templateUrl: './qualification-details.component.html',
  styleUrl: './qualification-details.component.css'
})
export class QualificationDetailsComponent implements OnInit {
  qualification: Skill | null = null;
  employees: Employee[] = [];
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

  getInitials(employee: Employee): string {
    const first = employee.firstName?.charAt(0) || '';
    const last = employee.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  viewEmployee(employee: Employee) {
    this.router.navigate(['/employees', employee.id]);
  }

  editQualification() {
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  onQualificationSave(qualification: Skill) {
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
