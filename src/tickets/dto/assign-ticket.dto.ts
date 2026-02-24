import { IsNotEmpty, IsNumber } from 'class-validator';

export class AssignTicketDto {
    @IsNotEmpty()
    @IsNumber()
    userId: number;
}
