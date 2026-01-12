import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Activity {
  userName: string;
  action: string;
  timestamp: Date;
  userInitials: string;
}

@Component({
    selector: 'app-home',
    imports: [CommonModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {
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

  constructor(private router: Router) {}

  navigateToEmployees() {
    this.router.navigate(['/employees']);
  }

  addNewEmployee() {
    // TODO: Implement add employee functionality
    console.log('Add new employee clicked');
  }

  searchEmployee() {
    // TODO: Implement search employee functionality
    console.log('Search employee clicked');
  }
}
