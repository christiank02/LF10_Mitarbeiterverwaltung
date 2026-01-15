import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Employee } from '../../Employee';

interface Activity {
  userName: string;
  action: string;
  timestamp: Date;
  userInitials: string;
}

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  showSearchModal = false;
  searchTerm = '';
  allEmployees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  
  activities: Activity[] = [
    {
      userName: 'Anna Bella',
      action: 'wurde hinzugefügt',
      timestamp: new Date('2026-01-12T10:30:00'),
      userInitials: 'AB'
    },
    {
      userName: 'Max Müller',
      action: 'wurde aktualisiert',
      timestamp: new Date('2026-01-12T09:15:00'),
      userInitials: 'MM'
    },
    {
      userName: 'Sarah Schmidt',
      action: 'wurde gelöscht',
      timestamp: new Date('2026-01-12T08:45:00'),
      userInitials: 'SS'
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    if (this.showSearchModal) {
      this.closeSearchModal();
    }
  }

  navigateToEmployees() {
    this.router.navigate(['/employees']);
  }

  navigateToQualifications() {
    this.router.navigate(['/qualifications']);
  }

  addNewEmployee() {
    console.log('Add new employee clicked');
  }

  addNewQualification() {
    console.log('Add new qualification clicked');
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

    this.filteredEmployees = this.allEmployees.filter(emp => {
      const firstName = emp.firstName?.toLowerCase() || '';
      const lastName = emp.lastName?.toLowerCase() || '';
      const fullName = (firstName + ' ' + lastName).toLowerCase();
      const fullNameReverse = (lastName + ' ' + firstName).toLowerCase();
      const city = emp.city?.toLowerCase() || '';

      return fullName.includes(this.searchTerm.toLowerCase()) ||
             city.includes(this.searchTerm.toLowerCase()) ||
          fullNameReverse.includes(this.searchTerm.toLowerCase());
    });
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
