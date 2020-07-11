import { UserService } from './../../service/user.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/model/user';
import { AlertifyService } from 'src/app/service/alertify.service';
import { ActivatedRoute } from '@angular/router';
import {
  NgxGalleryOptions,
  NgxGalleryImage,
  NgxGalleryAnimation,
} from 'ngx-gallery-9';
import { TabsetComponent } from 'ngx-bootstrap/tabs';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css'],
})
export class MemberDetailComponent implements OnInit {
  @ViewChild('tabset', { static: true }) tabset: TabsetComponent;
  user: User;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  constructor(
    private userService: UserService,
    private alertify: AlertifyService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.user = data['userResol'];
    });

    this.route.queryParams.subscribe(p => {
      let s = +p['tab'];
      if(s < 0) s = 0;
      this.selectTab(s);
    });

    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Rotate,
        imagePercent: 100,
        preview: false,
      },
    ];

    this.galleryImages = this.getImages();
  }

  getImages() {
    const imgs = [];
    for (const photo of this.user.photos) {
      imgs.push({
        small: photo.url,
        medium: photo.url,
        big: photo.url,
        description: photo.description,
      });
    }
    return imgs;
  }

  selectTab(id: number) {
    this.tabset.tabs[id].active = true;
  }

  // loadUser() {
  //   let id: number = +this.route.snapshot.paramMap.get('id');
  //   this.userService.getUser(id).subscribe(
  //     (u: User) => (this.user = u),
  //     (err) => this.alertify.error(err)
  //   );
  // }
}
