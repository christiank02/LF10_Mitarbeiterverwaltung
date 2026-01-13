import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { TopbarComponent } from './components/topbar/topbar.component';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, TopbarComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'lf10StarterNew';
  showTopbar = true;

  constructor(private router: Router) {
    // Hide topbar on login page
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showTopbar = !event.url.includes('/login');
    });
  }
}
