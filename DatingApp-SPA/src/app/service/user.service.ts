import { Message } from './../model/message';
import { PaginatedResult } from './../model/pagination';
import { User } from './../model/user';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

// const httpOptions = {
//   headers: new HttpHeaders({
//     'Authorization': 'Bearer ' + localStorage.getItem('token') //dấu cách sau Bearer là vô vùng quan trọng
//   })
// }

@Injectable({
  providedIn: 'root',
})
export class UserService {
  baseUrl = environment.apiUrl + 'users';

  constructor(private http: HttpClient) {}

  getUsers(
    page?: number,
    itemsPerPage?,
    userParams?,
    likeParams?
  ): Observable<PaginatedResult<User[]>> {
    const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<
      User[]
    >();

    if (page == null || page === undefined) {
      page = 1;
    }
    if (itemsPerPage == null || itemsPerPage === undefined) {
      itemsPerPage = 12;
    }

    const obj: any = {
      pageNumber: page.toString(),
      pageSize: itemsPerPage.toString(),
      minAge: userParams?.minAge || 0,
      maxAge: userParams?.maxAge || 99,
      gender: userParams?.gender || 'all',
      orderBy: userParams?.orderBy || 'lastActive',
    };

    if (likeParams === 'Likers') {
      obj.likers = true;
    }
    if (likeParams === 'Likees') {
      obj.likees = true;
    }

    return this.http
      .get<User[]>(this.baseUrl, {
        observe: 'response',
        params: obj,
      })
      .pipe(
        map((response) => {
          paginatedResult.result = response.body;
          if (response.headers.get('Pagination') != null) {
            paginatedResult.pagination = JSON.parse(
              response.headers.get('Pagination')
            );
          }
          return paginatedResult;
        })
      );
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(this.baseUrl + '/' + id);
  }

  updateUser(id: number, user: User) {
    return this.http.put(this.baseUrl + '/' + id, user);
  }

  setMainPhoto(userId: number, photoId: number) {
    return this.http.post(
      `${this.baseUrl}/${userId}/photos/${photoId}/setMain`,
      {}
    );
  }

  deletePhoto(userId: number, photoId: number) {
    return this.http.delete(`${this.baseUrl}/${userId}/photos/${photoId}`);
  }

  sendLike(id: number, rid: number) {
    return this.http.post(`${this.baseUrl}/${id}/like/${rid}`, {});
  }

  getMessages(
    id: number,
    page?,
    itemsPerPage?,
    messageContainer?
  ): Observable<PaginatedResult<Message[]>> {
    const paginationResult: PaginatedResult<Message[]> = new PaginatedResult<
      Message[]
    >();

    if (page == null || page === undefined) {
      page = 1;
    }
    if (itemsPerPage == null || itemsPerPage === undefined) {
      itemsPerPage = 12;
    }

    const params: any = {
      messageContainer,
      pageNumber: page,
      pageSize: itemsPerPage,
    };

    return this.http
      .get<Message[]>(`${this.baseUrl}/${id}/message`, {
        observe: 'response',
        params,
      })
      .pipe(
        map((response) => {
          paginationResult.result = response.body;
          if (response.headers.get('Pagination') != null) {
            paginationResult.pagination = JSON.parse(
              response.headers.get('Pagination')
            );
          }

          return paginationResult;
        })
      );
  }

  getMessagesThread(id: number, rId: number){
    return this.http.get<Message[]>(`${this.baseUrl}/${id}/message/thread/${rId}`);
  }

  sendMessage(id: number, message: Message){
    return this.http.post(`${this.baseUrl}/${id}/message`, message);
  }

  deleteMessage(mid: number, id: number){
    return this.http.post(`${this.baseUrl}/${id}/message/${mid}`, {});
  }

  readMessage(id: number, mid: number){
    return this.http.post(`${this.baseUrl}/${id}/message/${mid}/read`, {}).subscribe();
  }
}
