import { IsNotEmpty, IsEnum, MinLength, IsOptional } from 'class-validator';
import { TicketPriority } from '../../common/enums/ticket.enum';

export class CreateTicketDto {
    @IsNotEmpty()
    @MinLength(5)
    title: string;

    @IsNotEmpty()
    @MinLength(10)
    description: string;

    @IsOptional()
    @IsEnum(TicketPriority)
    priority?: TicketPriority;
}
