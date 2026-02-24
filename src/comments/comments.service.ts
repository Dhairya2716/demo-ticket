import {
    Injectable,
    ForbiddenException,
    Inject,
    forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketComment } from '../entities/ticket-comment.entity';
import { TicketsService } from '../tickets/tickets.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UserRole } from '../common/enums/ticket.enum';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(TicketComment)
        private commentRepository: Repository<TicketComment>,
        @Inject(forwardRef(() => TicketsService))
        private ticketsService: TicketsService,
    ) { }

    async addComment(ticketId: number, dto: CreateCommentDto, user: any) {
        const ticket = await this.ticketsService.getTicketById(ticketId);

        const isManager = user.role === UserRole.MANAGER;
        const isAssignedSupport = user.role === UserRole.SUPPORT && ticket.assigned_to?.id === user.userId;
        const isTicketOwner = user.role === UserRole.USER && ticket.created_by?.id === user.userId;

        if (!isManager && !isAssignedSupport && !isTicketOwner) {
            throw new ForbiddenException('You are not allowed to comment on this ticket');
        }

        const comment = this.commentRepository.create({
            ticket: { id: ticketId } as any,
            user: { id: user.userId } as any,
            comment: dto.comment,
        });

        return this.commentRepository.save(comment);
    }

    async getCommentsByTicket(ticketId: number, user: any) {
        const ticket = await this.ticketsService.getTicketById(ticketId);

        const isManager = user.role === UserRole.MANAGER;
        const isAssignedSupport = user.role === UserRole.SUPPORT && ticket.assigned_to?.id === user.userId;
        const isTicketOwner = user.role === UserRole.USER && ticket.created_by?.id === user.userId;

        if (!isManager && !isAssignedSupport && !isTicketOwner) {
            throw new ForbiddenException('You are not allowed to view comments for this ticket');
        }

        return this.commentRepository.find({
            where: { ticket: { id: ticketId } as any },
            relations: ['user'],
            order: { created_at: 'DESC' },
        });
    }
}
