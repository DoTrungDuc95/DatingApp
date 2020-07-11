import { NgForm } from '@angular/forms';
import { AuthService } from './../../service/auth.service';
import { UserService } from 'src/app/service/user.service';
import { Message } from './../../model/message';
import { Component, OnInit, Input } from '@angular/core';
import { AlertifyService } from 'src/app/service/alertify.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css'],
})
export class MemberMessagesComponent implements OnInit {
  @Input() rId: number;
  messages: Message[];
  newMessage: any = {};

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private alertify: AlertifyService
  ) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages() {
    const id = +this.authService.decodeToken.nameid;
    this.userService
      .getMessagesThread(id, this.rId)
      .pipe(
        tap((m: Message[]) => {
          for (let i = 0; i < m.length; i++) {
            if (m[i].isRead === false && m[i].recipientId === id) {
              this.userService.readMessage(id, m[i].id);
            }
          }
        })
      )
      .subscribe(
        (data) => (this.messages = data),
        (err) => this.alertify.error(err)
      );
  }

  sendMessage(mesForm: NgForm) {
    if (mesForm.invalid) return;
    this.newMessage.recipientId = this.rId;

    const id = +this.authService.decodeToken.nameid;

    this.userService.sendMessage(id, this.newMessage).subscribe(
      (m: Message) => {
        this.messages.unshift(m);
        this.newMessage.content = '';
      },
      (err) => this.alertify.error(err)
    );
  }
}
