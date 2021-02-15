import { Injectable, OnModuleInit } from '@nestjs/common';
import { randomStringGenerator  } from '@nestjs/common/utils/random-string-generator.util';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { Settings } from './settings.entity';

@Injectable()
export class SettingsService implements OnModuleInit {

  constructor(
    @InjectRepository(Settings) private settingsRepository: Repository<Settings>,
  ) {}

  async onModuleInit() {
    const settings = await this.getSettings();
    if (!settings) {
      await this.settingsRepository.insert({
        secret: randomStringGenerator(),
        oldSecrets: []
      })
    }
  }

  async getSettings() {
    return await this.settingsRepository.findOne();
  }

  getRandomString(): string {
    return randomStringGenerator();
  }

  save(settings: Settings): Promise<Settings> {
    return this.settingsRepository.save(settings);
  }

  findOneWithId(id: number) {
    return this.settingsRepository.findOne(id);
  }

  async getSecret(): Promise<string> {
    const settings = await this.getSettings();
    return settings.secret;
  }

  async update(settingsParam: Partial<Settings>) {
    const settings = await this.getSettings();
    return this.settingsRepository.update(settings.id, settingsParam);
  }


}
