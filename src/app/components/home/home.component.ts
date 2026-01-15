import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {Employee, Skill} from '../../Employee';
import { SearchService } from '../../services/search/search.service';
import { EmployeeModalComponent } from '../employee-modal/employee-modal.component';
import { QualificationModalComponent } from '../qualification-modal/qualification-modal.component';
import { EmployeeService } from '../../services/employee/employee.service';
import { QualificationService } from '../../services/qualification/qualification.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, FormsModule, EmployeeModalComponent, QualificationModalComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  showSearchModal = false;
  searchTerm = '';
  allEmployees: Employee[] = [];
  filteredEmployees: Employee[] = [];

  showEmployeeModal = false;
  availableQualifications: Skill[] = [];

  showQualificationModal = false;

  totalEmployees = 0;
  totalQualifications = 0;
  recentEmployees: Employee[] = [];

  constructor(
    private router: Router,
    private searchService: SearchService,
    private employeeService: EmployeeService,
    private qualificationService: QualificationService
  ) {}

  ngOnInit() {
    this.loadStatistics();
  }

  loadStatistics() {
    this.employeeService.getAll().subscribe({
      next: (employees) => {
        this.totalEmployees = employees.length;
        this.recentEmployees = employees
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 3);
      },
      error: (err) => console.error('Error loading employees:', err)
    });

    this.qualificationService.getAll().subscribe({
      next: (qualifications) => {
        this.totalQualifications = qualifications.length;
      },
      error: (err) => console.error('Error loading qualifications:', err)
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    if (this.showSearchModal) {
      this.closeSearchModal();
    } else if (this.showEmployeeModal) {
      this.closeEmployeeModal();
    } else if (this.showQualificationModal) {
      this.closeQualificationModal();
    }
  }

  navigateToEmployees() {
    this.router.navigate(['/employees']);
  }

  navigateToQualifications() {
    this.router.navigate(['/qualifications']);
  }

  addNewEmployee() {
    this.fetchAvailableQualifications();
    this.showEmployeeModal = true;
  }

  addNewQualification() {
    this.showQualificationModal = true;
  }

  fetchAvailableQualifications() {
    this.qualificationService.getAll().subscribe({
      next: (data) => {
        this.availableQualifications = data;
      },
      error: (err) => console.error('Error fetching qualifications:', err)
    });
  }

  closeEmployeeModal() {
    this.showEmployeeModal = false;
  }

  onEmployeeSave(employee: Employee) {
    const requestBody = this.employeeService.prepareEmployeeData(employee, this.availableQualifications);

    this.employeeService.create(requestBody).subscribe({
      next: () => {
        this.closeEmployeeModal();
        this.router.navigate(['/employees']);
      },
      error: (err) => console.error('Error adding employee:', err)
    });
  }

  closeQualificationModal() {
    this.showQualificationModal = false;
  }

  onQualificationSave(qualification: Skill) {
    this.qualificationService.create(qualification).subscribe({
      next: () => {
        this.closeQualificationModal();
        this.router.navigate(['/qualifications']);
      },
      error: (err) => console.error('Error adding qualification:', err)
    });
  }

  searchEmployee() {
    this.showSearchModal = true;
    this.searchTerm = '';
    this.filteredEmployees = [];
    this.loadEmployees();

    setTimeout(() => {
      this.searchInput?.nativeElement.focus();
    }, 0);
  }

  loadEmployees() {
    this.employeeService.getAll().subscribe(employees => {
      this.allEmployees = employees;
      this.applySearchFilter();
    });
  }

  applySearchFilter() {
    if (!this.searchTerm.trim()) {
      this.filteredEmployees = [];
      return;
    }

    this.filteredEmployees = this.searchService.filterEmployees(
      this.allEmployees,
      this.searchTerm
    );
  }

  onSearchChange() {
    this.applySearchFilter();
  }

  closeSearchModal() {
    this.showSearchModal = false;
    this.searchTerm = '';
    this.filteredEmployees = [];
  }

  viewEmployeeDetails(employee: Employee) {
    this.router.navigate(['/employees', employee.id]);
    this.closeSearchModal();
  }

  getInitials(employee: Employee): string {
    const firstInitial = employee.firstName?.charAt(0) || '';
    const lastInitial = employee.lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase();
  }
}
