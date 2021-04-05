import { Component } from '@angular/core';

@Component({
  selector: 'hz-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(){
    const supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
    document.body.classList.add(supportsTouch ? 'touch' : 'no-touch');
  }

}
