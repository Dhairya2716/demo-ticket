import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Role } from './role.entity';
import { Ticket } from './ticket.entity';
import { TicketComment } from './ticket-comment.entity';
import { TicketStatusLog } from './ticket-status-log.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @ManyToOne(() => Role, (role) => role.users)
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => Ticket, (ticket) => ticket.created_by)
    createdTickets: Ticket[];

    @OneToMany(() => Ticket, (ticket) => ticket.assigned_to)
    assignedTickets: Ticket[];

    @OneToMany(() => TicketComment, (comment) => comment.user)
    comments: TicketComment[];

    @OneToMany(() => TicketStatusLog, (log) => log.changedBy)
    statusLogs: TicketStatusLog[];
}
