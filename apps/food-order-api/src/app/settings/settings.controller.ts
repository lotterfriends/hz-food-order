import { Body, Controller, Get, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { editFileName, imageFileFilter } from '../helper/upload.helper';
import { Settings } from './settings.entity';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Put()
  @UseGuards(JwtAuthGuard)
  async update(@Body() settings: Settings) {
    await this.settingsService.update(settings);
    return await this.settingsService.getSettings();
  }
  
  @Put('update-secret')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  getSettings() {
    return this.settingsService.getSettings();
  }
  
  @Get('client')
  getClientSettings() {
    return this.settingsService.getSettings({
      select: [
        'updated',
        'seperateOrderPerProductCategory',
        'orderCode',
        'whileStocksLast',
        'pickupOrder',
        'orderSound',
        'logo',
        'tableCode'
      ]
    });
  }

  @Get('random')
  @UseGuards(JwtAuthGuard)
  getRandomString()  {
    return { secret: this.settingsService.getRandomString() };
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    })
  )
  @UseGuards(JwtAuthGuard)
  @Post('upload-logo')
  async uploadLogo(
    @UploadedFile() file,
  ) {
    if (file) {
      await this.settingsService.update({logo: file.filename});
      return {
        filename: file.filename,
      };
    }
  }
}
