import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { UserRole } from './common/enums/ticket.enum';

@Injectable()
export class DatabaseSeeder implements OnModuleInit {
    private readonly logger = new Logger(DatabaseSeeder.name);

    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async onModuleInit() {
        await this.seedRoles();
        await this.seedDefaultAdmin();
    }

    private async seedRoles() {
        for (const roleName of Object.values(UserRole)) {
            const exists = await this.roleRepository.findOne({ where: { name: roleName } });
            if (!exists) {
                await this.roleRepository.save(this.roleRepository.create({ name: roleName }));
                this.logger.log(`Role created: ${roleName}`);
            }
        }
    }

    private async seedDefaultAdmin() {
        const adminEmail = 'admin@example.com';
        const exists = await this.userRepository.findOne({ where: { email: adminEmail } });

        if (!exists) {
            const managerRole = await this.roleRepository.findOne({ where: { name: UserRole.MANAGER } });
            if (!managerRole) {
                this.logger.error('MANAGER role not found, skipping admin seed');
                return;
            }

            const hashed = await bcrypt.hash('admin123', 10);

            await this.userRepository.save(
                this.userRepository.create({
                    name: 'System Admin',
                    email: adminEmail,
                    password: hashed,
                    role: managerRole,
                }),
            );
            this.logger.log(`Default admin created: ${adminEmail}`);
        }
    }
}
