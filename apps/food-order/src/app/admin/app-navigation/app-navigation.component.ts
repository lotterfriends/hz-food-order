import { Component } from '@angular/core';
import { ScrollStateService } from '../../scroll-state.service';
import { adminRoutes } from '../admin-routing.module';
import { NgxPermissionsService } from 'ngx-permissions';
import { Role } from '../../auth.service';

interface NavRoute{
  path: string;
  data: {
    title: string;
    icon?: string;
  };
}

@Component({
  selector: 'hz-navigation',
  templateUrl: './app-navigation.component.html',
  styleUrls: ['./app-navigation.component.scss']
})
export class AppNavigationComponent {

  mainRoutes = [];
  constructor(
    private scrollStateService: ScrollStateService,
    private ngxPermissionsService: NgxPermissionsService
  ) {
    this.ngxPermissionsService.hasPermission(Role.Admin).then((isAdmin) => {
      this.mainRoutes = adminRoutes.filter((e) => {
        if ((e.path === 'settings' || e.path === 'user') && !isAdmin) {
          return false;
        }
        return e.path?.length && e.path !== '**';
      }) as NavRoute[];
    });
    this.updateZoom();
  }


  onOpen(): void {
    setTimeout(() => {
      if (document.getElementsByClassName('list-item-active').length) {
        (document.getElementsByClassName('list-item-active')[0] as HTMLAnchorElement).focus();
      }
    }, 200);
  }

  plus() {
    let zoom = window.sessionStorage.getItem('zoom') ? parseFloat(window.sessionStorage.getItem('zoom')) : 1;
    zoom = zoom + 0.25;
    window.sessionStorage.setItem('zoom', '' + zoom);
    this.updateZoom();
  }
  
  minus() {
    let zoom = window.sessionStorage.getItem('zoom') ? parseFloat(window.sessionStorage.getItem('zoom')) : 1;
    zoom = zoom - 0.25;
    window.sessionStorage.setItem('zoom', '' + zoom);
    this.updateZoom();
  }

  updateZoom() {
    (window as any).updateZoom();
  }

  onScroll(event) {
    this.scrollStateService.scrolling(event);
  }
}
