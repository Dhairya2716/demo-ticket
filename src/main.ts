import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe - enforces all DTO decorators (@MinLength, @IsEmail, etc.)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // Strip properties with no decorators
    forbidNonWhitelisted: false,
    transform: true,        // Auto-transform types (e.g. string -> number for @Param)
  }));

  // Swagger documentation at /docs
  const config = new DocumentBuilder()
    .setTitle('Support Ticket Management API')
    .setDescription('Support Ticket Management — Student Project Assignment')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`Swagger docs at: http://localhost:${process.env.PORT ?? 3000}/docs`);
}
bootstrap();
