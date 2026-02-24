import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { TicketStatus, TicketPriority } from '../common/enums/ticket.enum';
import { User } from './user.entity';
import { TicketComment } from './ticket-comment.entity';
import { TicketStatusLog } from './ticket-status-log.entity';

@Entity('tickets')
export class Ticket {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.OPEN,
    })
    status: TicketStatus;

    @Column({
        type: 'enum',
        enum: TicketPriority,
        default: TicketPriority.MEDIUM,
    })
    priority: TicketPriority;

    @ManyToOne(() => User, (user) => user.createdTickets)
    @JoinColumn({ name: 'created_by' })
    created_by: User;

    @ManyToOne(() => User, (user) => user.assignedTickets, { nullable: true })
    @JoinColumn({ name: 'assigned_to' })
    assigned_to: User;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => TicketComment, (comment) => comment.ticket)
    comments: TicketComment[];

    @OneToMany(() => TicketStatusLog, (log) => log.ticket)
    statusLogs: TicketStatusLog[];
}
