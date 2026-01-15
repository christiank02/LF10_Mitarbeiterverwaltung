import {Component, OnInit} from '@angular/core';
import {AuthService} from "../services/auth/auth.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-callback',
    standalone: true,
    imports: [],
    templateUrl: './callback.component.html',
    styleUrl: './callback.component.css'
})
export class CallbackComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    console.log("Handling OAuth2 callback...");
    await this.authService.handleCallback();

    this.router.navigate(['/']);
  }
}
