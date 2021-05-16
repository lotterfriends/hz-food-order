import { combineLatest } from 'rxjs';
import { AuthService } from './auth.service';
import { SettingsService } from './settings.service';

export function appInitializer(authService: AuthService, settingsService: SettingsService): () => Promise<unknown> {
  return () => new Promise(resolve => {
    // attempt to refresh token on app start up to auto authenticate
    const setSettings$ = settingsService.setSettings();
    const tokenRefresh$ = authService.refreshTokenWithTimer();

    combineLatest([setSettings$, tokenRefresh$]).subscribe(resolve)
  });
}
