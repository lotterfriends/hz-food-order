import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogModel } from 'libs/ui/src/lib/confirm-dialog/confirm-dialog.component';
import { first } from 'rxjs/operators';
import { Role, User } from '../../auth.service';
import { AdminUserService } from '../services/admin-user.service';

@Component({
  selector: 'hz-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  roles = Role;
  roleList = Object.values(Role);
  users$ = this.userService.getAll();
  fg = this.createUserForm(null);

  constructor(
    private userService: AdminUserService,
    private dialog: MatDialog,
  ) {}
    
  ngOnInit(): void {
  }

  getEnumKeyByEnumValue(myEnum: any, enumValue: number | string): string {
    let keys = Object.keys(myEnum).filter((x) => myEnum[x] == enumValue);
    return keys.length > 0 ? keys[0] : '';
  }

  createUserForm(user: User) {
    return new FormGroup({
      id: new FormControl(user?.id ? user.id : 'new'),
      username: new FormControl(user?.username, [
        Validators.required,
        Validators.minLength(4)
      ]),
      active: new FormControl(user?.active),
      password: new FormControl(),
      roles: new FormControl(user?.roles),
    })
  }

  refresh() {
    this.users$ = this.userService.getAll();
    this.unselect();
  }

  onSelection(selectedUser) {
    this.fg = this.createUserForm(selectedUser)
  }

  unselect() {
    this.fg = this.createUserForm(null);
  }

  delete(event: MouseEvent, user: User) {
    event.stopPropagation();
    event.preventDefault();
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(null, `Wollen sie den User "${user.username}" wirklich löschen?`)
    });

    dialogRef.afterClosed().pipe(first()).subscribe(dialogResult => {
      if (dialogResult) {
        this.userService.delete(user.id).pipe(first()).subscribe(_ => {
          this.refresh();
        });
      }
    });
  }

  create() {
    const user = this.fg.getRawValue() as User;
    delete user.id;
    this.userService.create(user).pipe(first()).subscribe(_ => {
      this.refresh();
    });
  }

  update() {
    const user = this.fg.getRawValue() as User;
    if (!this.fg.get('password').touched || !user.password.length) {
      delete user.password;
    }
    this.userService.update(user.id, user).pipe(first()).subscribe(_ => {
      this.refresh();
    });
  }


}
