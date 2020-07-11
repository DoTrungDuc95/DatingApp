import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/model/user';
import { UserService } from 'src/app/service/user.service';
import { AlertifyService } from 'src/app/service/alertify.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css'],
})
export class MemberCardComponent implements OnInit {
  @Input() user: User;

  constructor(
    private userService: UserService,
    private alertify: AlertifyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  sendLike(rid: number) {
    const id = +this.authService.decodeToken.nameid;
    this.userService.sendLike(id, rid).subscribe(
      (data) => {
        this.alertify.success('You have liked: ' + this.user.knowAs);
      },
      (err) => this.alertify.error(err)
    );
  }
}
