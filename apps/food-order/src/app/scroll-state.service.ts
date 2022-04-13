import { EventEmitter, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollStateService {

  public onScroll: EventEmitter<{}> = new EventEmitter<{}>(null);

  scrolling(event) {
    this.onScroll.emit(event);
  }

}
