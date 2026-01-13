import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Qualification } from '../../Qualification';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-qualifications',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './qualifications.component.html',
  styleUrl: './qualifications.component.css'
})
export class QualificationsComponent implements OnInit {
  qualifications: Qualification[] = [];
  filteredQualifications: Qualification[] = [];
  paginatedQualifications: Qualification[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  // Search
  searchTerm = '';
  
  // Modal
  showModal = false;
  isEditMode = false;
  currentQualification: Qualification = { skill: '' };
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchQualifications();
  }

  fetchQualifications() {
    const token = this.authService.getAccessToken();
    this.http.get<Qualification[]>('http://localhost:8089/qualifications', {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
    }).subscribe({
      next: (data) => {
        this.qualifications = data;
        this.applyFilters();
      },
      error: (err) => console.error('Error fetching qualifications:', err)
    });
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
    this.currentQualification = { skill: '' };
    this.showModal = true;
  }

  openEditModal(qualification: Qualification) {
    this.isEditMode = true;
    this.currentQualification = { ...qualification };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentQualification = { skill: '' };
  }

  saveQualification() {
    if (!this.currentQualification.skill.trim()) return;

    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    if (this.isEditMode) {
      // Update qualification
      this.http.put(`http://localhost:8089/qualifications/${this.currentQualification.id}`, 
        this.currentQualification, 
        { headers }
      ).subscribe({
        next: () => {
          this.fetchQualifications();
          this.closeModal();
        },
        error: (err) => console.error('Error updating qualification:', err)
      });
    } else {
      // Add new qualification
      this.http.post('http://localhost:8089/qualifications', 
        this.currentQualification, 
        { headers }
      ).subscribe({
        next: () => {
          this.fetchQualifications();
          this.closeModal();
        },
        error: (err) => console.error('Error adding qualification:', err)
      });
    }
  }

  deleteQualification(qualification: Qualification) {
    if (!confirm(`Are you sure you want to delete "${qualification.skill}"?`)) return;

    const token = this.authService.getAccessToken();
    this.http.delete(`http://localhost:8089/qualifications/${qualification.id}`, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
    }).subscribe({
      next: () => this.fetchQualifications(),
      error: (err) => console.error('Error deleting qualification:', err)
    });
  }

  viewDetails(qualification: Qualification) {
    this.router.navigate(['/qualifications', qualification.id]);
  }
}
