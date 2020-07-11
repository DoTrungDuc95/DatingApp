import { AuthService } from './../service/auth.service';
import { Message } from './../model/message';
import { catchError } from 'rxjs/operators';
import { AlertifyService } from '../service/alertify.service';
import { UserService } from '../service/user.service';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageResolver implements Resolve<Message[]> {
  pageNumber = 1;
  pageSize = 6;
  messageContainer = 'Unread';

  resolve(route: ActivatedRouteSnapshot): Observable<Message[]> {
    const id = +this.authService.decodeToken.nameid;
    return this.userService
      .getMessages(id, this.pageNumber, this.pageSize, this.messageContainer)
      .pipe(
        catchError((err) => {
          this.alertify.error('Error when retrieving messages');
          this.router.navigate(['/home']);
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
