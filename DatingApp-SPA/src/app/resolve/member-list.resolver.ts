import { catchError } from 'rxjs/operators';
import { AlertifyService } from '../service/alertify.service';
import { UserService } from '../service/user.service';
import { User } from '../model/user';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })

export class MemberListResolver implements Resolve<User[]> {
  pageNumber = 1;
  pageSize = 6;

  resolve(route: ActivatedRouteSnapshot): Observable<User[]> {
    return this.userService.getUsers(this.pageNumber, this.pageSize).pipe(
      catchError((err) => {
        this.alertify.error('Error when retrieving data');
        this.router.navigate(['/home']);
        return of(null);
      })
    );
  }

  constructor(
    private userService: UserService,
    private router: Router,
    private alertify: AlertifyService
  ) {}
}
