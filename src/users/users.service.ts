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

    async create(createUserDto: CreateUserDto) {
        const { email, password, role: roleName, name } = createUserDto;

        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const role = await this.roleRepository.findOne({ where: { name: roleName } });
        if (!role) {
            throw new NotFoundException(`Role ${roleName} not found`);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = this.userRepository.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        const savedUser = await this.userRepository.save(user);
        const { password: _, ...result } = savedUser;
        return result;
    }

    async findAll() {
        return this.userRepository.find({
            relations: ['role'],
        });
    }

    async findOneByEmail(email: string) {
        return this.userRepository.findOne({
            where: { email },
            relations: ['role'],
        });
    }

    async findOneById(id: number) {
        return this.userRepository.findOne({
            where: { id },
            relations: ['role'],
        });
    }
}
