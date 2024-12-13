import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('authToken');

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`  
        }
      });
    }

   
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        
        if (error.status === 401) {
          console.log('Token expired or invalid, redirecting to login.');
          this.router.navigateByUrl('/login');  
        }
        
        
        return throwError(error);
      })
    );
  }
}
