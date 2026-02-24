import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from '../common/enums/ticket.enum';
import { User } from './user.entity';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: UserRole, unique: true })
    name: UserRole;

    @OneToMany(() => User, (user) => user.role)
    users: User[];
}
