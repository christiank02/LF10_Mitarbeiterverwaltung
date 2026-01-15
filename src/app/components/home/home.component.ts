import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

interface Activity {
  userName: string;
  action: string;
  timestamp: Date;
  userInitials: string;
}

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
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
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  navigateToEmployees() {
    this.router.navigate(['/mitarbeiter']);
  }

  navigateToQualifications() {
    this.router.navigate(['/qualifikationen']);
  }

  addNewEmployee() {
    console.log('Add new employee clicked');
  }

  searchEmployee() {
    console.log('Search employee clicked');
  }
}
