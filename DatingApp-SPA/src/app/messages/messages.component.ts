import { UserService } from 'src/app/service/user.service';
import { AuthService } from './../service/auth.service';
import { Pagination } from './../model/pagination';
import { Message } from './../model/message';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from '../service/alertify.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
})
export class MessagesComponent implements OnInit {
  messages: Message[];
  pagination: Pagination;
  messageContainer = 'Unread';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private route: ActivatedRoute,
    private alertify: AlertifyService
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.messages = data['message'].result;
      this.pagination = data['message'].pagination;
    });
  }

  loadMessages() {
    const id = +this.authService.decodeToken.nameid;
    return this.userService
      .getMessages(
        id,
        this.pagination.currentPage,
        this.pagination.itemsPerPage,
        this.messageContainer
      )
      .subscribe(
        (res) => {
          this.messages = res.result;
          this.pagination = res.pagination;
        },
        (err) => this.alertify.error(err)
      );
  }

  deleteMessage(mid: number) {
    this.alertify.confirm('Are you sure you want to delete ?', () => {
      const id = +this.authService.decodeToken.nameid;
      this.userService.deleteMessage(mid, id).subscribe(
        () => {
          const index = this.messages.findIndex((m) => m.id === mid);
          this.messages.splice(index, 1);
          this.alertify.success('Successfully to delete message');
        },
        (err) => this.alertify.error(err)
      );
    });
  }

  pageChanged(e: any): void {
    this.pagination.currentPage = e.page;
    this.loadMessages();
  }
}
