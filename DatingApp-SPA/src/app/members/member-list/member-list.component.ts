import { Pagination, PaginatedResult } from './../../model/pagination';
import { UserService } from './../../service/user.service';
import { User } from './../../model/user';
import { Component, OnInit } from '@angular/core';
import { AlertifyService } from '../../service/alertify.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css'],
})
export class MemberListComponent implements OnInit {
  users: User[];
  user: User = JSON.parse(localStorage.getItem('user'));
  genderList = [
    { value: 'all', display: 'All' },
    { value: 'male', display: 'Males' },
    { value: 'female', display: 'Females' }
  ];
  userParams: any = {};
  pagination: Pagination;

  constructor(
    private userService: UserService,
    private alertify: AlertifyService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.users = data['usersResol'].result;
      this.pagination = data['usersResol'].pagination;
    });

    this.userParams.gender = 'all';
    this.userParams.minAge = 0;
    this.userParams.maxAge = 99;
    this.userParams.orderBy = 'lastActive';
  }

  pageChanged(e: any): void {
    this.pagination.currentPage = e.page;
    this.loadUsers();
  }

  resetFilters() {
    this.userParams.gender = 'all';
    this.userParams.minAge = 0;
    this.userParams.maxAge = 99;
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService
      .getUsers(this.pagination.currentPage, this.pagination.itemsPerPage, this.userParams)
      .subscribe(
        (data: PaginatedResult<User[]>) => {
          this.users = data.result;
          this.pagination = data.pagination;
        },
        (err) => this.alertify.error(err)
      );
  }
}
