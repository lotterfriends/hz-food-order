import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, first } from 'rxjs/operators';
import { OrderWSService } from '../order-ws.service';
import { Settings, SettingsService } from '../settings.service';

@Component({
  selector: 'hz-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
@UntilDestroy()
export class AdminComponent implements OnInit {

  audio: HTMLAudioElement;
  settings: Settings;

  constructor(
    private wsService: OrderWSService,
    private  settingsService: SettingsService
  ) {

    this.settingsService.getSettings().pipe(filter(e => e !== null), first()).subscribe(settings => {
      this.settings = settings;
    });

    if (this.settings.orderSound) {
      this.audio = new Audio();
      this.audio.src = './assets/sounds/egg-timer.wav';
      this.audio.load();
    }
  }


  ngOnInit(): void {

    this.wsService.isConnected.subscribe((connected: boolean) => {
      if (connected) {
        setTimeout(() => {
          this.wsService.registerAsUser();
        }, 500);
      }
    });

    if (this.settings.orderSound) {
      this.wsService.orderUpdate().pipe(untilDestroyed(this)).subscribe(order => {
        this.audio.play();
      });
    }

  }
}
