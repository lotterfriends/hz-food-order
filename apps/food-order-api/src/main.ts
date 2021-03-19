
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if(process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
    app.enableCors();
  }
  app.use(compression());
  app.useGlobalPipes(new ValidationPipe());
  const port = process.env.PORT || 3559;
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  await app.listen(port, () => {
    Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix);
  });
}
bootstrap();
