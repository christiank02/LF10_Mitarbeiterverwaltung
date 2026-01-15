import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {Observable, of} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Employee, Skill} from "../Employee";
import {AuthService} from "../services/auth/auth.service";
import {Qualification} from "../Qualification";
import {EmployeeModalComponent} from "../components/employee-modal/employee-modal.component";

@Component({
    selector: 'app-employee-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, EmployeeModalComponent],
    templateUrl: './employee-list.component.html',
    styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent implements OnInit {
  employees$: Observable<Employee[]>;
  allEmployees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  paginatedEmployees: Employee[] = [];

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  searchTerm = '';

  showSkillsModal = false;
  selectedEmployee: Employee | null = null;
  newSkill = '';

  showAddEmployeeModal = false;
  isEditMode = false;
  currentEmployee: Employee | null = null;
  availableQualifications: Qualification[] = [];


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
      const firstName = emp.firstName?.toLowerCase() || '';
      const lastName = emp.lastName?.toLowerCase() || '';
      const fullName = (firstName + ' ' + lastName).toLowerCase();
      const fullNameReverse = (lastName + ' ' + firstName).toLowerCase();

      return !this.searchTerm ||
        fullName.includes(this.searchTerm.toLowerCase()) ||
        fullNameReverse.includes(this.searchTerm.toLowerCase());
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
    this.isEditMode = true;
    this.currentEmployee = employee;
    this.fetchAvailableQualifications();
    this.showAddEmployeeModal = true;
  }

  deleteEmployee(employee: Employee) {
    if (!confirm(`Sind Sie sicher, dass Sie ${employee.firstName} ${employee.lastName} löschen möchten?`)) return;

    const token = this.authService.getAccessToken();
    this.http.delete(`http://localhost:8089/employees/${employee.id}`, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
    }).subscribe({
      next: () => this.fetchData(),
      error: (err) => console.error('Error deleting employee:', err)
    });
  }

  addEmployee() {
    this.isEditMode = false;
    this.currentEmployee = null;
    this.fetchAvailableQualifications();
    this.showAddEmployeeModal = true;
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

  closeAddEmployeeModal() {
    this.showAddEmployeeModal = false;
    this.currentEmployee = null;
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

    if (this.isEditMode && employee.id) {
      this.http.put(`http://localhost:8089/employees/${employee.id}`, requestBody, { headers }).subscribe({
        next: () => {
          this.fetchData();
          this.closeAddEmployeeModal();
        },
        error: (err) => console.error('Error updating employee:', err)
      });
    } else {
      // Create new employee
      this.http.post('http://localhost:8089/employees', requestBody, { headers }).subscribe({
        next: () => {
          this.fetchData();
          this.closeAddEmployeeModal();
        },
        error: (err) => console.error('Error adding employee:', err)
      });
    }
  }

  getInitials(employee: Employee): string {
    const first = employee.firstName?.charAt(0) || '';
    const last = employee.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  // Skills management
  viewSkills(employee: Employee) {
    this.selectedEmployee = employee;
    this.fetchAvailableQualifications();
    this.showSkillsModal = true;
  }

  closeSkillsModal() {
    this.showSkillsModal = false;
    this.selectedEmployee = null;
    this.newSkill = '';
  }

  addSkill() {
    if (!this.newSkill.trim() || !this.selectedEmployee) return;

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
    if (!this.selectedEmployee.skillSet) {
      this.selectedEmployee.skillSet = [];
    }

    // Check if skill is not already in the list
    const alreadyExists = this.selectedEmployee.skillSet.some(s => s.skill === this.newSkill.trim());
    if (!alreadyExists) {
      this.selectedEmployee.skillSet.push({ skill: this.newSkill.trim(), id: qualification.id });
    }

    // Build the skillSet array with IDs
    const skillSetIds = this.selectedEmployee.skillSet.map(skill => {
      if ('id' in skill && skill.id !== undefined) {
        return skill.id;
      }
      const qual = this.availableQualifications.find(q => q.skill === skill.skill);
      return qual?.id;
    }).filter((id): id is number => id !== undefined);

    // Prepare the employee update body
    const requestBody = {
      lastName: this.selectedEmployee.lastName,
      firstName: this.selectedEmployee.firstName,
      street: this.selectedEmployee.street || '',
      postcode: this.selectedEmployee.postcode || '',
      city: this.selectedEmployee.city || '',
      phone: this.selectedEmployee.phone || '',
      skillSet: skillSetIds
    };

    // Update the entire employee via PUT
    this.http.put(`http://localhost:8089/employees/${this.selectedEmployee.id}`,
      requestBody,
      { headers }
    ).subscribe({
      next: () => {
        this.newSkill = '';
        this.fetchData(); // Refresh to get updated data
      },
      error: (err) => console.error('Error adding skill:', err)
    });
  }

  isSkillAlreadyAdded(skillName: string): boolean {
    return this.selectedEmployee?.skillSet?.some(skill => skill.skill === skillName) || false;
  }

  deleteSkill(skill: Skill) {
    if (!this.selectedEmployee || !skill.id) return;

    const token = this.authService.getAccessToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    // Remove skill from employee's skillSet
    if (this.selectedEmployee.skillSet) {
      this.selectedEmployee.skillSet = this.selectedEmployee.skillSet.filter(s => s.skill !== skill.skill);
    }

    // Build the skillSet array with IDs
    const skillSetIds = this.selectedEmployee.skillSet?.map(s => {
      if ('id' in s && s.id !== undefined) {
        return s.id;
      }
      const qual = this.availableQualifications.find(q => q.skill === s.skill);
      return qual?.id;
    }).filter((id): id is number => id !== undefined) || [];

    // Prepare the employee update body
    const requestBody = {
      lastName: this.selectedEmployee.lastName,
      firstName: this.selectedEmployee.firstName,
      street: this.selectedEmployee.street || '',
      postcode: this.selectedEmployee.postcode || '',
      city: this.selectedEmployee.city || '',
      phone: this.selectedEmployee.phone || '',
      skillSet: skillSetIds
    };

    // Update the entire employee via PUT
    this.http.put(`http://localhost:8089/employees/${this.selectedEmployee.id}`,
      requestBody,
      { headers }
    ).subscribe({
      next: () => {
        this.fetchData(); // Refresh to get updated data
      },
      error: (err) => console.error('Error deleting skill:', err)
    });
  }

  getSkillsDisplay(employee: Employee): string {
    if (!employee.skillSet || employee.skillSet.length === 0) {
      return '-';
    }
    const skills = employee.skillSet.map(s => s.skill).slice(0, 2).join(', ');
    return employee.skillSet.length > 2 ? `${skills} +${employee.skillSet.length - 2}` : skills;
  }

  viewEmployeeDetails(employee: Employee) {
    this.router.navigate(['/employees', employee.id]);
  }
}
