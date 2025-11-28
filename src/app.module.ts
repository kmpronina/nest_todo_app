import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import dbConfig from './config/db.config';

import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { UserContextMiddleware } from './common/middlewares/user-context.middleware';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [dbConfig]
        }),

        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const db = config.get('db');

                return {
                    ...db,
                    autoLoadEntities: true
                };
            }
        }),

        TasksModule,

        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET ?? 'super-secret-key',
            signOptions: { expiresIn: '1h' }
        }),

        UsersModule,

        AuthModule.forRoot({
            secret: 'super-secret-key',
            tokenPrefix: 'Bearer'
        })
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
        consumer.apply(UserContextMiddleware).forRoutes('tasks');
    }
}
