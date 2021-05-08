import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'hz-order-redirect',
  templateUrl: './order-redirect.component.html',
  styleUrls: ['./order-redirect.component.scss']
})
export class OrderRedirectComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const secret = params.get('secret');
      if (secret) {
        sessionStorage.setItem('secret', secret);
        this.router.navigate(['/order-table']);
      } else {
        sessionStorage.removeItem('secret');
        this.router.navigate(['/empty']);
      }
    });
  }

}
