import { Component } from '@angular/core';
import { adminRoutes } from '../admin-routing.module';

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

  constructor() {
    this.updateZoom();
  }

  mainRoutes = adminRoutes.filter(e => e.path?.length && e.path !== '**') as NavRoute[];

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
}
