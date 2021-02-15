import { Component } from '@angular/core';
import { adminRoutes } from '../admin-routing.module';

interface NavRoute{
  path: string;
  data: {
    title: string;
    icon?: string;
  }
}

@Component({
  selector: 'app-navigation',
  templateUrl: './app-navigation.component.html',
  styleUrls: ['./app-navigation.component.scss']
})
export class AppNavigationComponent {

  mainRoutes = adminRoutes.filter(e => e.path?.length && e.path !== '**') as NavRoute[];

}
