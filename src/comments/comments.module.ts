import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TicketComment } from '../entities/ticket-comment.entity';
import { Ticket } from '../entities/ticket.entity';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([TicketComment, Ticket]),
        forwardRef(() => TicketsModule),
    ],
    controllers: [CommentsController],
    providers: [CommentsService],
    exports: [CommentsService],
})
export class CommentsModule { }
