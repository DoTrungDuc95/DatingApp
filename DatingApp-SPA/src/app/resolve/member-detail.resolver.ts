import { catchError } from 'rxjs/operators';
import { AlertifyService } from '../service/alertify.service';
import { UserService } from '../service/user.service';
import { User } from '../model/user';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MemberDetailResolver implements Resolve<User> {
  resolve(route: ActivatedRouteSnapshot): Observable<User> {
    let id = +route.paramMap.get('id');
    return this.userService.getUser(id).pipe(
      catchError((err) => {
        this.alertify.error('Error when retrieving data');
        this.router.navigate(['/members']);
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
