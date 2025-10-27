import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    async onModuleInit() {
        this.logger.log('Connexion à la base de données...');
        await this.$connect();
        this.logger.log('Connexion à la base de données établie');
    }

    async onModuleDestroy() {
        this.logger.log('Fermeture de la connexion à la base de données...');
        await this.$disconnect();
        this.logger.log('Connexion à la base de données fermée');
    }

    async cleanDatabase() {
        if (process.env.NODE_ENV === 'production') return;

        this.logger.warn('Nettoyage de la base de données...');
        const models = Reflect.ownKeys(this).filter(key => key[0] !== '_');

        return Promise.all(models.map((modelKey) => this[modelKey].deleteMany()));
    }
}
