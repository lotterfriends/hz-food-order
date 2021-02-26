import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/auth.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
@UntilDestroy()
export class AppHeaderComponent implements OnInit {

  @Input() title = '';
  @Output() toggleSidenav = new EventEmitter<void>();
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {

    console.log(this.route.snapshot.data);

    this.router.events.pipe(filter(e => e instanceof NavigationEnd), untilDestroyed(this)).subscribe(event => {

      const adminRouts = this.router.config.find(e => e.path === 'admin')?.children;
      if (adminRouts) {
        const currentRouteConfig = adminRouts.find(e => `/admin/${e.path}` === (event as NavigationEnd).url);
        if (currentRouteConfig && currentRouteConfig.data && currentRouteConfig.data.title) {
          this.title = currentRouteConfig.data.title.trim();
        }
      }
    });
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.authService.logout();
  }

}
