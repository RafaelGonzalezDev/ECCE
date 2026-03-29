import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Global validation pipe - enforces class-validator decorators
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,         // strip properties not in DTO
      forbidNonWhitelisted: true,
      transform: true,         // auto-transform payloads to DTO instances
    }),
  );

  // CORS - allow the Next.js frontend
  app.enableCors({
    origin: config.get<string>('FRONTEND_URL', 'http://localhost:3000'),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`🚀 ECCE Backend running on http://localhost:${port}/api`);
}
bootstrap();
