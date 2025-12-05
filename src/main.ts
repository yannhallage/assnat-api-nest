import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');;
import { config } from 'dotenv';
config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // -----------------------------
  // Validation des variables d'environnement requises
  // -----------------------------
  const requiredEnvVars = ['JWT_SECRET'];
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.error(
      `Variables d'environnement manquantes: ${missingVars.join(', ')}`,
    );
    logger.error('Veuillez créer un fichier .env avec ces variables.');
    process.exit(1);
  }

  // Création de l'application Nest
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'], // logging complet
  });

  // -----------------------------
  // Middleware de sécurité
  // -----------------------------
  app.use(helmet()); // sécurise les headers HTTP
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*', // configurer pour ton front
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.use(cookieParser()); // pour gérer les cookies
  app.use(compression());  // compression gzip pour réduire la taille des réponses

  // -----------------------------
  // Middleware de logging HTTP
  // -----------------------------
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev')); // log léger en dev
  } else {
    app.use(morgan('combined')); // log complet en prod
  }

  // -----------------------------
  // Pipes de validation globale
  // -----------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // supprime les propriétés non déclarées dans les DTO
      forbidNonWhitelisted: true, // lance une erreur si une propriété inconnue est envoyée
      transform: true, // transforme les payloads en DTO
      transformOptions: { enableImplicitConversion: true }, // conversion automatique des types
    }),
  );

  // -----------------------------
  // Configuration Swagger / OpenAPI
  // -----------------------------
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API RH / Gestion des congés')
    .setDescription('API pour gérer les demandes de congés, personnel et services')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'Authorization',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
  logger.log('Swagger docs available at /api/docs');

  // -----------------------------
  // Lancement du serveur
  // -----------------------------
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3003; // <-- ici
  await app.listen(port);
  logger.log(`Application is running on port: ${port}`);

}

bootstrap();
