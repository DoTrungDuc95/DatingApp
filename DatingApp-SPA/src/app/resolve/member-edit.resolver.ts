import { AuthService } from './../service/auth.service';
import { catchError, tap } from 'rxjs/operators';
import { AlertifyService } from '../service/alertify.service';
import { UserService } from '../service/user.service';
import { User } from '../model/user';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MemberEditResolver implements Resolve<User> {
  resolve(route: ActivatedRouteSnapshot): Observable<User> {
    console.log(this.authService.decodeToken);
    return this.userService.getUser(+this.authService.decodeToken.nameid).pipe(
      tap(d => console.log(d)),
      catchError((err) => {
        this.alertify.error('Error when retrieving your data');
        this.router.navigate(['/members']);
        return of(null);
      })
    );
  }

  constructor(
    private userService: UserService,
    private router: Router,
    private alertify: AlertifyService,
    private authService: AuthService
  ) {}
}
