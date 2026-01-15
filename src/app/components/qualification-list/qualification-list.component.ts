import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { QualificationModalComponent } from '../qualification-modal/qualification-modal.component';
import { QualificationService } from '../../services/qualification/qualification.service';
import { EmployeeService } from '../../services/employee/employee.service';
import {Skill} from "../../Employee";

@Component({
  selector: 'app-qualification-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, QualificationModalComponent],
  templateUrl: './qualification-list.component.html',
  styleUrl: './qualification-list.component.css'
})
export class QualificationListComponent implements OnInit {
  qualifications: Skill[] = [];
  filteredQualifications: Skill[] = [];
  paginatedQualifications: Skill[] = [];
  employees: any[] = [];

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  searchTerm = '';

  showModal = false;
  isEditMode = false;
  currentQualification: Skill | null = null;

  constructor(
    private qualificationService: QualificationService,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchQualifications();
    this.fetchEmployees();
  }

  fetchQualifications() {
    this.qualificationService.getAll().subscribe({
      next: (data) => {
        this.qualifications = data;
        this.applyFilters();
      },
      error: (err) => console.error('Error fetching qualifications:', err)
    });
  }

  fetchEmployees() {
    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: (err) => console.error('Error fetching employees:', err)
    });
  }

  getEmployeeCount(qualificationId: number | undefined): number {
    if (!qualificationId) return 0;
    return this.employees.filter(emp =>
      emp.skillSet?.some((skill: any) => skill.id === qualificationId)
    ).length;
  }

  applyFilters() {
    this.filteredQualifications = this.qualifications.filter(q =>
      !this.searchTerm || q.skill.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    this.totalItems = this.filteredQualifications.length;
    this.updatePagination();
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedQualifications = this.filteredQualifications.slice(startIndex, endIndex);
  }

  onSearchChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get startItem(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentQualification = null;
    this.showModal = true;
  }

  openEditModal(qualification: Skill) {
    this.isEditMode = true;
    this.currentQualification = qualification;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentQualification = null;
  }

  onQualificationSave(qualification: Skill) {
    if (this.isEditMode && qualification.id) {
      this.qualificationService.update(qualification.id, qualification).subscribe({
        next: () => {
          this.fetchQualifications();
          this.closeModal();
        },
        error: (err) => console.error('Error updating qualification:', err)
      });
    } else {
      this.qualificationService.create(qualification).subscribe({
        next: () => {
          this.fetchQualifications();
          this.closeModal();
        },
        error: (err) => console.error('Error adding qualification:', err)
      });
    }
  }

  deleteQualification(qualification: Skill) {
    if (!confirm(`Sind Sie sicher, dass Sie "${qualification.skill}" löschen möchten?`)) return;

    this.qualificationService.delete(qualification.id!).subscribe({
      next: () => this.fetchQualifications(),
      error: (err) => console.error('Error deleting qualification:', err)
    });
  }

  viewDetails(qualification: Skill) {
    this.router.navigate(['/qualifications', qualification.id]);
  }
}
