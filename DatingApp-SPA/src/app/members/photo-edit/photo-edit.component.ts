import { AlertifyService } from './../../service/alertify.service';
import { environment } from 'src/environments/environment';
import { Photo } from './../../model/photo';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { AuthService } from 'src/app/service/auth.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-photo-edit',
  templateUrl: './photo-edit.component.html',
  styleUrls: ['./photo-edit.component.css'],
})
export class PhotoEditComponent implements OnInit {
  @Input() photos: Photo[];
  @Output() getMemberPhotoChange = new EventEmitter<string>();
  uploader: FileUploader;
  hasBaseDropZoneOver: boolean;
  response: string;
  baseUrl = environment.apiUrl;
  currentPhoto: Photo;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private alertify: AlertifyService
  ) {}

  ngOnInit(): void {
    this.initFileUpload();
    this.hasBaseDropZoneOver = false;
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  private initFileUpload() {
    this.uploader = new FileUploader({
      url:
        this.baseUrl +
        'users/' +
        this.authService.decodeToken.nameid +
        '/photos',
      authToken: 'Bearer ' + localStorage.getItem('token'),
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024,
    });

    this.uploader.onAfterAddingFile = (f) => {
      f.withCredentials = false;
    };

    this.uploader.onSuccessItem = (item, response, status, hearders) => {
      if (response) {
        const res = JSON.parse(response);
        const photo = {
          id: res.id,
          url: res.url,
          dateAdded: res.dateAdded,
          description: res.description,
          isMain: res.isMain,
        };
        this.photos.push(photo);
        if(photo.isMain){
          this.authService.changeMemberPhoto(photo.url);
          this.authService.currentUser.photoUrl = photo.url;
          localStorage.setItem(
            'user',
            JSON.stringify(this.authService.currentUser)
          );
        }
      }
    };
  }

  setMainPhoto(photo: Photo) {
    const id = +this.authService.decodeToken.nameid;
    this.userService.setMainPhoto(id, photo.id).subscribe(
      () => {
        this.currentPhoto = this.photos.find((p) => p.isMain);
        this.currentPhoto.isMain = false;
        photo.isMain = true;
        this.authService.changeMemberPhoto(photo.url);
        this.authService.currentUser.photoUrl = photo.url;
        localStorage.setItem(
          'user',
          JSON.stringify(this.authService.currentUser)
        );
        this.alertify.success('Successfully to set main photo');
      },
      (err) => this.alertify.error(err)
    );
  }

  deletePhoto(id: number) {
    this.alertify.confirm(
      'Are you sure you want to delete this photo ?',
      () => {
        const uesrId = +this.authService.decodeToken.nameid;
        this.userService.deletePhoto(uesrId, id).subscribe(
          () => {
            const photoId = this.photos.findIndex((p) => p.id === id);
            this.photos.splice(photoId, 1);
            this.alertify.success('Photo has been deleted');
          },
          (err) => this.alertify.error(err)
        );
      }
    );
  }
}
