import { AlertifyService } from './../service/alertify.service';
import { Pagination, PaginatedResult } from './../model/pagination';
import { Component, OnInit } from '@angular/core';
import { User } from '../model/user';
import { UserService } from '../service/user.service';
import { AuthService } from '../service/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent implements OnInit {
  users: User[];
  pagination: Pagination;
  likesParam: string;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private alertify: AlertifyService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.users = data['list'].result;
      this.pagination = data['list'].pagination;
    });

    this.likesParam = 'Likers';
  }

  loadUsers(): void {
    this.userService
      .getUsers(this.pagination.currentPage, this.pagination.itemsPerPage, null, this.likesParam)
      .subscribe(
        (data: PaginatedResult<User[]>) => {
          this.users = data.result;
          this.pagination = data.pagination;
        },
        (err) => this.alertify.error(err)
      );
  }
  
  pageChanged(e: any): void {
    this.pagination.currentPage = e.page;
    this.loadUsers();
  }
}
