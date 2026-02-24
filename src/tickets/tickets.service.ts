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

    async createTicket(createTicketDto: CreateTicketDto, user: any) {
        const ticket = this.ticketRepository.create({
            ...createTicketDto,
            created_by: { id: user.userId } as any,
            status: TicketStatus.OPEN,
        });
        return this.ticketRepository.save(ticket);
    }

    async getAllTickets(user: any) {
        const tickets = await this.ticketRepository.find({
            relations: ['created_by', 'created_by.role', 'assigned_to', 'assigned_to.role'],
        });

        if (user.role === UserRole.SUPPORT) {
            return tickets.filter(ticket => ticket.assigned_to?.id === user.userId);
        }

        if (user.role === UserRole.USER) {
            return tickets.filter(ticket => ticket.created_by?.id === user.userId);
        }

        return tickets;
    }

    async getTicketById(id: number) {
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
            throw new NotFoundException('Ticket not found');
        }

        return ticket;
    }

    async assignTicket(id: number, assignTicketDto: AssignTicketDto) {
        const ticket = await this.getTicketById(id);

        const user = await this.userRepository.findOne({
            where: { id: assignTicketDto.userId },
            relations: ['role'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.role.name === UserRole.USER) {
            throw new BadRequestException('Cannot assign ticket to a user with USER role');
        }

        ticket.assigned_to = user;
        await this.ticketRepository.save(ticket);

        return this.getTicketById(id);
    }

    async changeStatus(id: number, updateStatusDto: UpdateStatusDto, requestUser: any) {
        const ticket = await this.getTicketById(id);
        const oldStatus = ticket.status;
        const newStatus = updateStatusDto.status;

        if (!this.isValidStatusChange(oldStatus, newStatus)) {
            throw new BadRequestException('Invalid status transition: ' + oldStatus + ' -> ' + newStatus);
        }

        ticket.status = newStatus;
        await this.ticketRepository.save(ticket);

        const log = this.statusLogRepository.create({
            ticket: { id: ticket.id } as any,
            old_status: oldStatus,
            new_status: newStatus,
            changedBy: { id: requestUser.userId } as any,
        });
        await this.statusLogRepository.save(log);

        return this.getTicketById(id);
    }

    private isValidStatusChange(current: string, next: string): boolean {
        if (current === 'OPEN' && next === 'IN_PROGRESS') return true;
        if (current === 'IN_PROGRESS' && next === 'RESOLVED') return true;
        if (current === 'RESOLVED' && next === 'CLOSED') return true;
        return false;
    }

    async deleteTicket(id: number) {
        const ticket = await this.getTicketById(id);
        await this.ticketRepository.remove(ticket);
    }
}
