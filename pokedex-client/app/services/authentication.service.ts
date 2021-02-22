import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '@models/user.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  isLoggedIn = false;
  currentUser: User = { _id: '', email: '', name: '', role: '' };

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService
  ) { }

  getRefreshToken(): void {
    const refreshToken = localStorage.getItem('refreshToken') || '';
    if (refreshToken) {
      this.refreshToken().subscribe();
    } else {
      this.logout();
    }
  }

  register(user: any): Observable<any> {
    return this.http.post<any>('/auth/register', user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>('/auth/login', credentials).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        this.decodeAccessToken();
      })
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken') || '';
    return this.http.post<any>('/auth/refresh-token', { refreshToken }).pipe(
      tap({
        next: response => {
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          this.decodeAccessToken();
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.isLoggedIn = false;
    this.currentUser = { _id: '', email: '', name: '', role: '' };
  }

  decodeAccessToken(): void {
    try {
      this.isLoggedIn = true;
      const accessToken = localStorage.getItem('accessToken') || '';
      const decodedUser = this.jwtHelper.decodeToken(accessToken).user;
      const { _id, name, email, role } = decodedUser;
      this.currentUser = { _id, name, email, role };
    } catch (error) {
      this.logout();
    }
  }

}
