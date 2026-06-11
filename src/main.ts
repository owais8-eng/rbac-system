import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(bodyParser.text({ type: 'text/plain' }));
  app.use((req, _res, next) => {
    if (req.headers['content-type'] === 'text/plain' && typeof req.body === 'string') {
      try { req.body = JSON.parse(req.body); } catch { /* leave as-is */ }
    }
    next();
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();