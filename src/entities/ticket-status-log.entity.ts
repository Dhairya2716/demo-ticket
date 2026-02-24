import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Ticket } from './ticket.entity';
import { User } from './user.entity';
import { TicketStatus } from '../common/enums/ticket.enum';

@Entity('ticket_status_logs')
export class TicketStatusLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: TicketStatus,
    })
    old_status: TicketStatus;

    @Column({
        type: 'enum',
        enum: TicketStatus,
    })
    new_status: TicketStatus;

    @CreateDateColumn({ name: 'changed_at' })
    changed_at: Date;

    @ManyToOne(() => Ticket, (ticket) => ticket.statusLogs, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'ticket_id' })
    ticket: Ticket;

    @ManyToOne(() => User, (user) => user.statusLogs)
    @JoinColumn({ name: 'changed_by' })
    changedBy: User;
}
