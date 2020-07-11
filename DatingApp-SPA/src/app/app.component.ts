import { Component, OnInit } from '@angular/core';
import { AuthService } from './service/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from './model/user';
import { TimeagoIntl } from 'ngx-timeago';
import { strings as vie } from 'ngx-timeago/language-strings/vi';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  jwtHelper = new JwtHelperService();

  constructor(private authService: AuthService, private intl: TimeagoIntl) {}

  ngOnInit(): void {
    this.intl.strings = vie;
    this.intl.changes.next();
    const token = localStorage.getItem('token');
    const user: User = JSON.parse(localStorage.getItem('user'));
    if (token) {
      this.authService.decodeToken = this.jwtHelper.decodeToken(token);
    }
    if (user) {
      this.authService.currentUser = user;
      this.authService.changeMemberPhoto(user.photoUrl);
    }
  }
}
