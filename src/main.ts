import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Activation de la validation automatique des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans les DTOs
      forbidNonWhitelisted: true, // Rejette (400) les requêtes contenant des propriétés inconnues
      transform: true, // Transforme les payloads en véritables instances de classe DTO
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Pokemon API')
    .setDescription('The Pokemon API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(
    '', // 👈 path du Swagger (root path ici)
    app,
    documentFactory,
    // 👇 Utilisation de Swagger UI v5 via un CDN pour que cela fonctionne sur Vercel
    {
      customCssUrl: 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css',
      customfavIcon: 'https://unpkg.com/swagger-ui-dist@5/favicon-32x32.png',
      customJs: [
        'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js',
        'https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js',
      ],
    },
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
