import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { TicketStatusLog } from '../entities/ticket-status-log.entity';
import { User } from '../entities/user.entity';
import { TicketStatus, UserRole } from '../common/enums/ticket.enum';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';

@Injectable()
export class TicketsService {
    constructor(
        @InjectRepository(Ticket)
        private ticketRepository: Repository<Ticket>,
        @InjectRepository(TicketStatusLog)
        private statusLogRepository: Repository<TicketStatusLog>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async create(createTicketDto: CreateTicketDto, user: any) {
        const ticket = this.ticketRepository.create({
            ...createTicketDto,
            created_by: { id: user.userId } as any,
            status: TicketStatus.OPEN,
        });
        return this.ticketRepository.save(ticket);
    }

    async findAll(user: any) {
        const query = this.ticketRepository.createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.created_by', 'created_by')
            .leftJoinAndSelect('ticket.assigned_to', 'assigned_to')
            .leftJoinAndSelect('created_by.role', 'creatorRole')
            .leftJoinAndSelect('assigned_to.role', 'assigneeRole');

        if (user.role === UserRole.SUPPORT) {
            query.andWhere('assigned_to.id = :userId', { userId: user.userId });
        } else if (user.role === UserRole.USER) {
            query.andWhere('created_by.id = :userId', { userId: user.userId });
        }

        return query.getMany();
    }

    async findOne(id: number) {
        const ticket = await this.ticketRepository.findOne({
            where: { id },
            relations: [
                'created_by',
                'created_by.role',
                'assigned_to',
                'assigned_to.role',
                'comments',
                'comments.user',
                'comments.user.role',
            ],
        });
        if (!ticket) {
            throw new NotFoundException(`Ticket with ID ${id} not found`);
        }
        return ticket;
    }

    async assign(id: number, assignTicketDto: AssignTicketDto) {
        const ticket = await this.findOne(id);
        const targetUser = await this.userRepository.findOne({
            where: { id: assignTicketDto.userId },
            relations: ['role'],
        });

        if (!targetUser) {
            throw new NotFoundException('User not found');
        }

        if (targetUser.role.name === UserRole.USER) {
            throw new BadRequestException('Tickets cannot be assigned to users with role USER');
        }

        ticket.assigned_to = targetUser;
        await this.ticketRepository.save(ticket);

        // Re-fetch with all relations to return full object
        return this.findOne(id);
    }

    async updateStatus(id: number, updateStatusDto: UpdateStatusDto, user: any) {
        const ticket = await this.findOne(id);
        const newStatus = updateStatusDto.status;
        const oldStatus = ticket.status;

        if (!this.isValidTransition(oldStatus, newStatus)) {
            throw new BadRequestException(`Invalid status transition from ${oldStatus} to ${newStatus}`);
        }

        ticket.status = newStatus;
        await this.ticketRepository.save(ticket);

        // Log the status change
        const log = this.statusLogRepository.create({
            ticket: { id: ticket.id } as any,
            old_status: oldStatus,
            new_status: newStatus,
            changedBy: { id: user.userId } as any,
        });
        await this.statusLogRepository.save(log);

        // Re-fetch with all relations
        return this.findOne(id);
    }

    private isValidTransition(oldStatus: TicketStatus, newStatus: TicketStatus): boolean {
        const transitions: Record<TicketStatus, TicketStatus[]> = {
            [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS],
            [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED],
            [TicketStatus.RESOLVED]: [TicketStatus.CLOSED],
            [TicketStatus.CLOSED]: [],
        };
        return transitions[oldStatus]?.includes(newStatus) ?? false;
    }

    async remove(id: number): Promise<void> {
        const ticket = await this.findOne(id);
        await this.ticketRepository.remove(ticket);
    }
}
