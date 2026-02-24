import {
    Injectable,
    NotFoundException,
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

    async create(ticketId: number, createCommentDto: CreateCommentDto, user: any) {
        const ticket = await this.ticketsService.findOne(ticketId);

        // Permission Check: MANAGER; SUPPORT if assigned; USER if owner
        const isAllowed =
            user.role === UserRole.MANAGER ||
            (user.role === UserRole.SUPPORT && ticket.assigned_to?.id === user.userId) ||
            (user.role === UserRole.USER && ticket.created_by?.id === user.userId);

        if (!isAllowed) {
            throw new ForbiddenException(
                'You do not have permission to comment on this ticket',
            );
        }

        const comment = this.commentRepository.create({
            ticket: { id: ticketId } as any,
            user: { id: user.userId } as any,
            comment: createCommentDto.comment,
        });

        return this.commentRepository.save(comment);
    }

    async findAllByTicket(ticketId: number, user: any) {
        const ticket = await this.ticketsService.findOne(ticketId);

        // Same permission check as create
        const isAllowed =
            user.role === UserRole.MANAGER ||
            (user.role === UserRole.SUPPORT && ticket.assigned_to?.id === user.userId) ||
            (user.role === UserRole.USER && ticket.created_by?.id === user.userId);

        if (!isAllowed) {
            throw new ForbiddenException(
                'You do not have permission to view comments for this ticket',
            );
        }

        return this.commentRepository.find({
            where: { ticket: { id: ticketId } as any },
            relations: ['user'],
            order: { created_at: 'DESC' },
        });
    }

    async update(id: number, createCommentDto: CreateCommentDto, user: any) {
        const comment = await this.commentRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        // Permission Check: MANAGER or comment author
        if (user.role !== UserRole.MANAGER && comment.user?.id !== user.userId) {
            throw new ForbiddenException('You can only edit your own comments');
        }

        comment.comment = createCommentDto.comment;
        return this.commentRepository.save(comment);
    }

    async remove(id: number, user: any): Promise<void> {
        const comment = await this.commentRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        // Permission Check: MANAGER or comment author
        if (user.role !== UserRole.MANAGER && comment.user?.id !== user.userId) {
            throw new ForbiddenException('You can only delete your own comments');
        }

        await this.commentRepository.remove(comment);
    }
}
