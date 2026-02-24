import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '../common/enums/ticket.enum';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
    ) { }

    async createUser(createUserDto: CreateUserDto) {
        const existing = await this.userRepository.findOne({ where: { email: createUserDto.email } });
        if (existing) {
            throw new ConflictException('User with this email already exists');
        }

        const role = await this.roleRepository.findOne({ where: { name: createUserDto.role } });
        if (!role) {
            throw new NotFoundException('Role not found');
        }

        const hashed = await bcrypt.hash(createUserDto.password, 10);

        const user = this.userRepository.create({
            name: createUserDto.name,
            email: createUserDto.email,
            password: hashed,
            role,
        });

        const saved = await this.userRepository.save(user);
        const { password, ...result } = saved;
        return result;
    }

    async getAllUsers() {
        return this.userRepository.find({
            relations: ['role'],
        });
    }

    async getUserByEmail(email: string) {
        return this.userRepository.findOne({
            where: { email },
            relations: ['role'],
        });
    }

    async getUserById(id: number) {
        return this.userRepository.findOne({
            where: { id },
            relations: ['role'],
        });
    }
}
