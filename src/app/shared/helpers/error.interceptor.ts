import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '../services/auth/authentication.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService, private route:ActivatedRoute, private router:Router) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status == 401) {
                // auto logout if 401 response returned from api
                localStorage.removeItem("currentUser")
                this.authenticationService.login()
                location.reload(true);
            }
            if (err.status === 501) {
                // auto logout if 501 response returned from api
                // this.router.navigateByUrl('/404');
            }
            
            const error = err.error.message || err.statusText;
            return throwError(error);
        }))
    }
}