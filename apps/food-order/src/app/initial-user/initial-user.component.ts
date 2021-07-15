import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AdminUserService } from '../admin/services/admin-user.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'hz-initial-user',
  templateUrl: './initial-user.component.html',
  styleUrls: ['./initial-user.component.scss']
})
export class InitialUserComponent implements OnInit {

  constructor(
    protected userService: AdminUserService,
    private authService: AuthService,
    private router: Router
  ) { }

  fg: FormGroup;
  hide1 = true;
  hide2 = true;

  ngOnInit(): void {

    this.authService.hasUser().pipe(first()).subscribe(hasUser => {
      if (hasUser) {
        this.router.navigate(['/login']);
      }
    });

    this.fg = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(2)
      ]),
      password:new FormControl('', Validators.required),
      ['password-repeat']: new FormControl('')
    })
  }

  onPasswordChange() {
    if (this.fg.get('password-repeat').value && this.fg.get('password-repeat').value === this.fg.get('password').value) {
      this.fg.get('password-repeat').setErrors(null);
    } else {
      this.fg.get('password-repeat').setErrors({ mismatch: true });
    }
  }

  create() {
    const user = this.fg.getRawValue();
    this.userService.createAdminUser(user).pipe(first()).subscribe(() => {
      this.router.navigate(['/login']);
    }, console.error);
  }
}
