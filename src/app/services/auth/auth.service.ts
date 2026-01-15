import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authConfig: AuthConfig = {
    issuer: 'http://localhost:9001/application/o/employee_api/',
    clientId: 'employee_api_client',
    redirectUri: window.location.origin + '/callback',
    responseType: 'code',
    scope: 'openid profile email offline_access',
    showDebugInformation: true,
    requireHttps: false,
    postLogoutRedirectUri: window.location.origin,
    strictDiscoveryDocumentValidation: false
  };

  private configurePromise: Promise<void>;
  private readonly SESSION_KEY = 'isLoggedIn';

  private loggedInSubject = new BehaviorSubject<boolean>(this.checkInitialLoginStatus());
  public loggedIn$: Observable<boolean> = this.loggedInSubject.asObservable();

  constructor(
    private oauthService: OAuthService,
  ) {
    this.configurePromise = this.configure();
  }

  private checkInitialLoginStatus(): boolean {
    try {
      return sessionStorage.getItem(this.SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  }

  private async configure() {
    this.oauthService.configure(this.authConfig);

    try {
      await this.oauthService.loadDiscoveryDocument();

      const discoveryDoc = (this.oauthService as any).discoveryDocument;
      if (discoveryDoc) {
        const endpointFields = [
          'authorization_endpoint',
          'token_endpoint',
          'userinfo_endpoint',
          'jwks_uri',
          'end_session_endpoint',
          'revocation_endpoint',
          'introspection_endpoint'
        ];

        endpointFields.forEach(field => {
          if (Array.isArray(discoveryDoc[field]) && discoveryDoc[field].length > 0) {
            discoveryDoc[field] = discoveryDoc[field][0];
          }
        });

        (this.oauthService as any).discoveryDocument = discoveryDoc;
      }

      this.oauthService.setupAutomaticSilentRefresh();
    } catch (error) {
      console.error('Fehler beim Laden des Discovery-Dokuments:', error);
    }
  }

  public async handleCallback(): Promise<boolean> {
    try {
      await this.configurePromise;
      await this.oauthService.tryLogin();
      const isValid = this.hasValidToken();
      if (isValid) {
        sessionStorage.setItem(this.SESSION_KEY, 'true');
        this.loggedInSubject.next(true);
      }
      return isValid;
    } catch (error) {
      console.error('Fehler beim Login-Callback:', error);
      return false;
    }
  }

  public async login() {
    await this.configurePromise;
    this.oauthService.initCodeFlow();
  }

  public logout() {
    this.oauthService.logOut();
    sessionStorage.removeItem(this.SESSION_KEY);
    this.loggedInSubject.next(false);
  }

  public hasValidToken(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  public isLoggedIn(): boolean {
    try {
      const sessionLoggedIn = sessionStorage.getItem(this.SESSION_KEY) === 'true';
      const hasToken = this.hasValidToken();
      return sessionLoggedIn && hasToken;
    } catch (error) {
      console.error('SessionStorage access error:', error);
      return this.hasValidToken();
    }
  }

  public getAccessToken(): string {
    return this.oauthService.getAccessToken();
  }
}
