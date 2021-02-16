import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Settings } from './settings.entity';
import { SettingsService } from './settings.service';


@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Put()
  async update(@Body() settings: Settings) {
    return this.settingsService.update(settings);
  }
  
  @Put('update-secret')
  async updateSecret(@Body() settingsSecret: {secret: string}) {
    if (settingsSecret && settingsSecret.secret.length && settingsSecret.secret.length> 5)  {
      const currentSettings = await this.settingsService.getSettings();

      // nothing changed
      if (settingsSecret.secret === currentSettings.secret) {
        return currentSettings;
      }

      if (currentSettings.oldSecrets && currentSettings.oldSecrets.length) {
        currentSettings.oldSecrets.push(currentSettings.secret);
      } else {
        currentSettings.oldSecrets = [currentSettings.secret];
      }
      await this.settingsService.update({secret: settingsSecret.secret, oldSecrets: currentSettings.oldSecrets});
      return await this.settingsService.getSettings();
    }
  }

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Get('random')
  getRandomString()  {
    return { secret: this.settingsService.getRandomString() };
  }
}
