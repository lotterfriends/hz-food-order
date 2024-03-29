import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Component({
  selector: 'hz-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  @ViewChild('loginCard') loginCard: ElementRef | undefined;
  @Input() username = '';
  @Input() password = '';

  ngOnInit(): void {

    this.authService.hasUser().pipe(first()).subscribe(hasUser => {
      if (!hasUser) {
        this.router.navigate(['/initial-user']);
      }
    });

    if (typeof this.authService.getToken() === 'string') {
      this.router.navigate(['/admin']);
    }
  }

  login(): void {
    this.loginCard?.nativeElement.classList.remove('shake');
    this.authService.login(this.username, this.password).then(undefined, () => {
      this.loginCard?.nativeElement.classList.add('shake');
    });
  }

}
