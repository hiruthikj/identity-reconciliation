import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from 'src/config/config';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { HealthController } from './health/health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HealthModule } from './health/health.module';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    TerminusModule.forRoot({ logger: Logger }),
    ConfigModule.forRoot({
      load: [config],
      // envFilePath: ['.env'],
      ignoreEnvFile: false,
      isGlobal: true,
      cache: false,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisEnabled = configService.get<boolean>('redis.enabled');
        const ttlInMilliseconds = configService.get<number>(
          'cache.ttlInMilliseconds',
        );

        if (redisEnabled) {
          const host = configService.getOrThrow<string>('redis.host');
          const port = configService.getOrThrow<number>('redis.port');
          Logger.log(
            `Setting redis as the cache store host=${host},port=${port},ttl=${ttlInMilliseconds}ms`,
            'CacheSetup',
          );

          return {
            store: (await redisStore({
              socket: {
                host,
                port,
              },
              database: 0,
            })) as unknown as CacheStore,
            ttl: ttlInMilliseconds,
          };
        }
        Logger.log(
          `Setting in-memory cache store, ttl: ${ttlInMilliseconds}ms`,
          'CacheSetup',
        );

        return {
          store: 'memory',
          ttl: ttlInMilliseconds,
        };
      },
    }),
    HealthModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // name: "DB_Connection", // connection name // TODO
      useFactory: async (configService: ConfigService) => {
        return {
          logging: info => {
            Logger.log(info, 'DBLogs');
          },
          dialect: 'postgres',
          host: configService.getOrThrow('PGHOST'),
          port: parseInt(configService.getOrThrow('PGPORT')),
          username: configService.getOrThrow('PGUSER'),
          password: configService.getOrThrow('PGPASSWORD'),
          database: configService.getOrThrow('PGDATABASE'),
          models: [],
          autoLoadModels: true,
          synchronize: false,
          pool: {
            max: configService.getOrThrow<number>('db.pool.max'),
            min: configService.getOrThrow<number>('db.pool.min'),
            idle: configService.getOrThrow<number>('db.pool.idle'),
            acquire: configService.getOrThrow<number>('db.pool.acquireTimeout'),
          },
          dialectOptions: {
            ssl: true
          }
        };
      },
    }),
  ],
  controllers: [AppController, HealthController],
  providers: [Logger],
})
export class AppModule {}
