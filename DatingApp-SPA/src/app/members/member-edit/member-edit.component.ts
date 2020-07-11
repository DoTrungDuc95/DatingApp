import { AlertifyService } from 'src/app/service/alertify.service';
import { User } from './../../model/user';
import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { UserService } from 'src/app/service/user.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css'],
})
export class MemberEditComponent implements OnInit {
  user: User;
  photoUrl: string;
  @ViewChild('editForm', { static: true }) editForm: NgForm;
  @HostListener('window:beforeunload', ['$event'])
  unloadNotifycation($event: any) {
    if (this.editForm.dirty) {
      $event.returnValue = true;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private alertify: AlertifyService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.user = data['me'];
    });

    this.authService.currentPhotoUrl.subscribe((url) => (this.photoUrl = url));
  }

  updateUser() {
    const id = +this.authService.decodeToken.nameid;
    this.userService.updateUser(id, this.user).subscribe(
      (d) => {
        this.alertify.success('Profile update successfully');
        this.editForm.reset(this.user);
      },
      (err) => this.alertify.error(err)
    );
  }

  updateMainPhoto(url: string) {
    this.user.photoUrl = url;
  }
}
