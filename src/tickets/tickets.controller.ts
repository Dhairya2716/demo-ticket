import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/ticket.enum';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Post()
    @Roles(UserRole.USER, UserRole.MANAGER)
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createTicketDto: CreateTicketDto, @Request() req) {
        return this.ticketsService.createTicket(createTicketDto, req.user);
    }

    @Get()
    getAll(@Request() req) {
        return this.ticketsService.getAllTickets(req.user);
    }

    @Get(':id')
    getOne(@Param('id') id: string) {
        return this.ticketsService.getTicketById(+id);
    }

    @Patch(':id/assign')
    @Roles(UserRole.MANAGER, UserRole.SUPPORT)
    assign(@Param('id') id: string, @Body() assignTicketDto: AssignTicketDto) {
        return this.ticketsService.assignTicket(+id, assignTicketDto);
    }

    @Patch(':id/status')
    @Roles(UserRole.MANAGER, UserRole.SUPPORT)
    updateStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateStatusDto,
        @Request() req,
    ) {
        return this.ticketsService.changeStatus(+id, updateStatusDto, req.user);
    }

    @Delete(':id')
    @Roles(UserRole.MANAGER)
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<void> {
        await this.ticketsService.deleteTicket(+id);
    }
}
