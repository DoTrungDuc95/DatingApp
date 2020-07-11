import { MessageResolver } from './resolve/message.resolver';
import { ListsResolver } from './resolve/lists.resolver';
import { PreventUnsaveChangesGuard } from './guards/prevent-unsave-changes.guard';
import { MemberEditResolver } from './resolve/member-edit.resolver';
import { MemberEditComponent } from './members/member-edit/member-edit.component';
import { MemberListResolver } from './resolve/member-list.resolver';
import { MemberDetailResolver } from './resolve/member-detail.resolver';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { AuthGuard } from './guards/auth.guard';
import { ListComponent } from './list/list.component';
import { MessagesComponent } from './messages/messages.component';
import { MemberListComponent } from './members/member-list/member-list.component';
import { HomeComponent } from './home/home.component';
import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'members',
        component: MemberListComponent,
        resolve: { usersResol: MemberListResolver },
      },
      {
        path: 'members/:id',
        component: MemberDetailComponent,
        resolve: { userResol: MemberDetailResolver },
      },
      {
        path: 'member/edit',
        component: MemberEditComponent,
        resolve: { me: MemberEditResolver },
        canDeactivate: [PreventUnsaveChangesGuard],
      },
      {
        path: 'messages',
        component: MessagesComponent,
        resolve: { message: MessageResolver },
      },
      {
        path: 'lists',
        component: ListComponent,
        resolve: { list: ListsResolver },
      },
    ],
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
