import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, of } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Employee } from "../Employee";
import { AuthService } from "../services/auth/auth.service";

@Component({
    selector: 'app-employee-list',
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './employee-list.component.html',
    styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent implements OnInit {
  employees$: Observable<Employee[]>;
  allEmployees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  paginatedEmployees: Employee[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  // Filters
  searchTerm = '';
  selectedDepartment = '';
  selectedRole = '';
  
  departments: string[] = ['IT', 'HR', 'Sales', 'Marketing', 'Finance'];
  roles: string[] = ['Developer', 'Manager', 'Analyst', 'Designer', 'Consultant'];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    this.employees$ = of([]);
  }

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    const token = this.authService.getAccessToken();
    this.employees$ = this.http.get<Employee[]>('http://localhost:8089/employees', {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
    });
    
    this.employees$.subscribe(employees => {
      this.allEmployees = employees;
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredEmployees = this.allEmployees.filter(emp => {
      const matchesSearch = !this.searchTerm || 
        emp.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.lastName?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // For now, we'll just use search filter since Employee interface doesn't have department/role
      return matchesSearch;
    });
    
    this.totalItems = this.filteredEmployees.length;
    this.updatePagination();
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedEmployees = this.filteredEmployees.slice(startIndex, endIndex);
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

  editEmployee(employee: Employee) {
    // TODO: Implement edit functionality
    console.log('Edit employee:', employee);
  }

  deleteEmployee(employee: Employee) {
    // TODO: Implement delete functionality
    console.log('Delete employee:', employee);
  }

  addEmployee() {
    // TODO: Navigate to add employee page
    console.log('Add employee');
  }

  getInitials(employee: Employee): string {
    const first = employee.firstName?.charAt(0) || '';
    const last = employee.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }
}
