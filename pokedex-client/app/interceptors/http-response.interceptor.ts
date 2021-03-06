import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from '@services/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';

@Injectable()
export class HttpResponseInterceptor implements HttpInterceptor {

  private isRefreshingToken = false;

  constructor(
    private toastrService: ToastrService,
    private authService: AuthenticationService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((errorResponse: HttpErrorResponse) => {
        if (errorResponse.error) {
          const errorStatus = errorResponse.error.error?.status;
          const apiRegex = new RegExp('(?=.*/api/).*');

          if (apiRegex.test(request.url)) {
            if (errorStatus === 401) {
              return this.handleUnauthorizedError(request, next);
            }
          } else {
            if (request.url.includes('/auth/refresh-token')) {
              this.toastrService.warning('Your login credentials expired, please log in again');
              this.authService.logout();
            }
          }
        }

        return throwError(errorResponse);
      })
    );
  }

  private handleUnauthorizedError(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isRefreshingToken) {
      return next.handle(request);
    } else {
      this.isRefreshingToken = true;
      return this.authService.refreshToken().pipe(
        switchMap(response => {
          return next.handle(request.clone({
            setHeaders: { Authorization: `Bearer ${response.accessToken}` }
          }));
        }),
        finalize(() => this.isRefreshingToken = false)
      );
    }
  }
}
