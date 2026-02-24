import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { Ticket } from './entities/ticket.entity';
import { TicketComment } from './entities/ticket-comment.entity';
import { TicketStatusLog } from './entities/ticket-status-log.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TicketsModule } from './tickets/tickets.module';
import { CommentsModule } from './comments/comments.module';
import { DatabaseSeeder } from './database-seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [Role, User, Ticket, TicketComment, TicketStatusLog],
        synchronize: true,
        logging: false,
      }),
    }),
    AuthModule,
    UsersModule,
    TicketsModule,
    CommentsModule,
    TypeOrmModule.forFeature([Role, User]),
  ],
  providers: [DatabaseSeeder],
})
export class AppModule { }
