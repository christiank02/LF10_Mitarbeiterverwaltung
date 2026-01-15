import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Employee } from '../../Employee';
import { Qualification } from '../../Qualification';
import { SearchService } from '../../services/search/search.service';
import { EmployeeModalComponent } from '../employee-modal/employee-modal.component';
import { QualificationModalComponent } from '../qualification-modal/qualification-modal.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, FormsModule, EmployeeModalComponent, QualificationModalComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  showSearchModal = false;
  searchTerm = '';
  allEmployees: Employee[] = [];
  filteredEmployees: Employee[] = [];

  showEmployeeModal = false;
  availableQualifications: Qualification[] = [];

  showQualificationModal = false;

  // Statistics
  totalEmployees = 0;
  totalQualifications = 0;
  recentEmployees: Employee[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.loadStatistics();
    }
  }

  loadStatistics() {
    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    // Load employees for statistics
    this.http.get<Employee[]>('http://localhost:8089/employees', { headers }).subscribe({
      next: (employees) => {
        this.totalEmployees = employees.length;
        // Get last 5 employees (assuming higher IDs are newer)
        this.recentEmployees = employees
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 5);
      },
      error: (err) => console.error('Error loading employees:', err)
    });

    // Load qualifications for statistics
    this.http.get<Qualification[]>('http://localhost:8089/qualifications', { headers }).subscribe({
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
    const token = this.authService.getAccessToken();
    this.http.get<Qualification[]>('http://localhost:8089/qualifications', {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
    }).subscribe({
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

    this.http.post('http://localhost:8089/employees', requestBody, { headers }).subscribe({
      next: () => {
        this.closeEmployeeModal();
        // Optional: Zeige Erfolgsmeldung oder navigiere zur Employee-Liste
        this.router.navigate(['/employees']);
      },
      error: (err) => console.error('Error adding employee:', err)
    });
  }

  closeQualificationModal() {
    this.showQualificationModal = false;
  }

  onQualificationSave(qualification: Qualification) {
    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    this.http.post('http://localhost:8089/qualifications', qualification, { headers }).subscribe({
      next: () => {
        this.closeQualificationModal();
        // Optional: Zeige Erfolgsmeldung oder navigiere zur Qualifications-Liste
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
  }

  loadEmployees() {
    const token = this.authService.getAccessToken();
    this.http.get<Employee[]>('http://localhost:8089/employees', {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
    }).subscribe(employees => {
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
