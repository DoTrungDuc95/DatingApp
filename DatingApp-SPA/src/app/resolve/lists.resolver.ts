import { UserService } from '../service/user.service';
import { catchError } from 'rxjs/operators';
import { AlertifyService } from './../service/alertify.service';
import { User } from './../model/user';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class ListsResolver implements Resolve<User[]> {
  pageNumber = 1;
  pageSize = 6;
  likesParam = 'Likers';

  resolve(route: ActivatedRouteSnapshot): Observable<User[]> {
    return this.userService.getUsers(this.pageNumber, this.pageSize, null, this.likesParam).pipe(
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
