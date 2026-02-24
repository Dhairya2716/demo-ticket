import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto) {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .addSelect('user.password')
            .where('user.email = :email', { email: loginDto.email })
            .getOne();

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const passwordMatch = await bcrypt.compare(loginDto.password, user.password);
        if (!passwordMatch) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role.name,
            name: user.name,
        });

        return {
            access_token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.name,
            },
        };
    }
}
